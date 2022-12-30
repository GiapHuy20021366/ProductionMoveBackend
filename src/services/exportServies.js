import authenticationServices from './authenticationServices'
import db from '../models/index'
import { messageCreater } from './untilsServices'
import { Op } from 'sequelize'
import queryServices from './queryServices'
import mailServices from './mailServices'
import { pingSocket } from '../config/configSocket'
import { messageTitles } from '../config/constant'



/**
 * 
 * @param {Object} query 
 * @param {string} token 
 * @returns {Promise}
 */
async function findExportsByQuery(query, token) {
    return new Promise(async (resolve, reject) => {
        await authenticationServices.verifyToken(token).then(async (message) => {
            // Account not active
            if (message.data.data.status === 1) {
                reject(messageCreater(-7, 'error', `Account not active. Please active your account`))
                return
            }

            // Account is cancel
            if (message.data.data.status === 0) {
                reject(messageCreater(-8, 'error', `Account is cancel`))
                return
            }

            try {
                const where = queryServices.parseQuery(query, db.Models)
                const page = query?.pageOffset?.offset
                const limit = query?.pageOffset?.limit
                const include = []
                const associates = query.associates
                if (associates) {
                    // Product
                    if (associates?.product) {
                        const productAssociate = {
                            model: db.Products,
                            as: 'product',
                            include: []
                        }
                        include.push(productAssociate)

                        // model
                        if (associates.product?.model) {
                            const modelAssociate = {
                                model: db.Models,
                                as: 'model',
                                include: []
                            }
                            productAssociate.include.push(modelAssociate)

                            // factory
                            if (associates.product.model?.factory) {
                                const factoryAssociate = {
                                    model: db.Partners,
                                    as: 'factory',
                                    attributes: ['id', 'name', 'email', 'phone', 'address', 'role']
                                }
                                modelAssociate.include.push(factoryAssociate)
                            }
                        }
                    }

                    // sender
                    if (associates?.sender) {
                        const senderAssociate = {
                            model: db.Partners,
                            as: 'sender',
                            attributes: ['id', 'name', 'email', 'phone', 'address', 'role']
                        }
                        include.push(senderAssociate)
                    }

                    // reciever
                    if (associates?.reciever) {
                        const recieverAssociate = {
                            model: db.Partners,
                            as: 'reciever',
                            attributes: ['id', 'name', 'email', 'phone', 'address', 'role']
                        }
                        include.push(recieverAssociate)
                    }
                }

                const { count, rows } = await db.Exports.findAndCountAll({
                    where: where,
                    include: include,
                    offset: page,
                    limit: limit
                }).catch((error) => {
                    console.log(error)
                    reject(messageCreater(-5, 'error', 'Database Error!'))
                })

                resolve(messageCreater(1, 'success', `Found ${rows.length} exports`, { count, rows }))
            } catch (error) {
                console.log(error)
                reject(messageCreater(-2, 'error', error.message))
            }

        }).catch((error) => {
            // Token error
            reject(messageCreater(-2, 'error', `Authentication failed: ${error.name}`))
        })
    })
}


/**
 * 
 * @param {Object} query 
 * @param {string} token 
 * @returns {Promise}
 */
async function exportProducts(data, token) {
    const listId = data.listId
    const toPartnerId = data.toPartnerId
    const type = data.type ? data.type : 0
    const note = data.note
    return new Promise(async (resolve, reject) => {
        await authenticationServices.verifyToken(token).then(async (message) => {
            // Account not active
            if (message.data.data.status === 1) {
                reject(messageCreater(-7, 'error', `Account not active. Please active your account`))
                return
            }

            // Account is cancel
            if (message.data.data.status === 0) {
                reject(messageCreater(-8, 'error', `Account is cancel`))
                return
            }
            try {

                const toPartnerDB = await db.Partners.findByPk(toPartnerId, {
                    attributes: ['id', 'name', 'email', 'phone', 'address', 'role']
                })
                const fromPartnerDB = await db.Partners.findByPk(message.data.data.id, {
                    attributes: ['id', 'name', 'email', 'phone', 'address', 'role']
                })
                if (!toPartnerDB) {
                    reject(messageCreater(-2, 'error', `Can't find partner with id = ${toPartnerId}`))
                    return
                }

                const partnerId = message.data.data.id
                if (partnerId === toPartnerId) {
                    reject(messageCreater(-1, 'error', `Can't self export!`))
                    return
                }
                const productHolders = await db.ProductHolders.findAll({
                    where: {
                        productId: {
                            [Op.or]: listId
                        }
                    }
                })

                let validAll = true
                productHolders.forEach((holder) => {
                    if (holder.partner1Id !== partnerId) {
                        reject(messageCreater(-1, 'error', `No permission to export product with id ${holder.productId}`))
                        validAll = false
                        return
                    }
                    if (holder.partner1Id === partnerId && holder.partner2Id !== -1) {
                        reject(messageCreater(-1, 'error', `No permission to export product with id ${holder.productId}`))
                        validAll = false
                        return
                    }
                })
                if (!validAll) return // Some product invalid to export

                const exports = []
                listId.forEach((productId) => {
                    const _export = {
                        productId: productId,
                        partnerSenderId: partnerId,
                        partnerRecieverId: toPartnerId,
                        date: new Date(),
                        type: type,
                        note: note,
                        confirm: false
                    }
                    exports.push(_export)
                })

                // Create exports
                const exportsDB = await db.Exports.bulkCreate(exports, { returning: true })

                // Save product status
                productHolders.forEach(async (holder) => {
                    holder.partner2Id = toPartnerId
                    await holder.save()
                })

                const productsDB = await db.Products.findAll({
                    where: {
                        id: {
                            [Op.or]: listId
                        }
                    },
                    include: [
                        {
                            model: db.Purchases,
                            as: 'purchase',
                            attributes: ['customerId'],
                            include: [
                                {
                                    model: db.Customers,
                                    as: 'customer'
                                }
                            ]
                        }
                    ]
                })

                const productIdToCustomer = {}
                productsDB.forEach((product) => {
                    if (product?.purchase?.customer) {
                        productIdToCustomer[product.id] = product.purchase.customer
                    }
                })

                // Send mail to customers
                exportsDB.forEach((_export) => {
                    switch (_export.type) {
                        case 1: // Maintain
                            // Send to customer
                            mailServices.sendMailWithForm(
                                'export-maintain-customer-form.ejs',
                                {
                                    customer: productIdToCustomer[_export.customerId],
                                    toPartner: toPartnerDB
                                },
                                productIdToCustomer[_export.customerId].email,
                                'Your product is now exporting'
                            )
                            break
                        case 2:
                            mailServices.sendSimpleEmail(
                                productIdToCustomer[_export.customerId].email,
                                'Sản phẩm bị phát hiện lỗi trong quá trinh bảo hành sản phẩm',
                                'Chúng tôi sẽ liên lạc và cam kết hoàn trả sản phẩm mới sớm nhất có thể. <br/> Xin lỗi quý khách.'
                            )
                            break
                    }
                })

                // Send to reciever
                mailServices.sendMailWithForm(
                    'export-email-notification.ejs',
                    {
                        fromPartner: fromPartnerDB,
                        toPartner: toPartnerDB,
                        exports: exportsDB,
                        products: productsDB
                    },
                    toPartnerDB.email,
                    `${fromPartnerDB.name} exports ${listId.length} products to you`
                )


                const content = {
                    type: 'EXPORT_NOTIFICATION',
                    from: fromPartnerDB,
                    listId: listId,
                    exports: exportsDB,
                    date: new Date()
                }
                // Create message form
                const messageForm = {
                    partnerId: toPartnerDB.id,
                    content: JSON.stringify(content),
                    date: new Date(),

                }

                const messageDB = await db.Messages.create(messageForm)
                const messagePing = {
                    id: messageDB.id,
                    date: messageForm.date,
                    content: content
                }
                pingSocket(toPartnerDB.id, messagePing, messageTitles.NEW_MESSAGE)

                resolve(messageCreater(1, 'success', `Export products successful!`, productsDB))
            } catch (error) {
                console.log(error)
                reject(messageCreater(-2, 'error', error.message))
            }

        }).catch((error) => {
            // Token error
            reject(messageCreater(-2, 'error', `Authentication failed: ${error.name}`))
        })
    })
}

/**
 * 
 * @param {Object} query 
 * @param {string} token 
 * @returns {Promise}
 */
async function confirmExports(exportIds, token) {
    return new Promise(async (resolve, reject) => {
        await authenticationServices.verifyToken(token).then(async (message) => {
            const partnerId = message.data.data.id
            try {
                const exportsDB = await db.Exports.findAll({
                    where: {
                        id: {
                            [Op.or]: exportIds
                        },
                        confirm: false
                    }
                })

                let invalidExport = null
                let isValidAllExport = exportsDB.every((export_) => {
                    if (export_.partnerRecieverId !== partnerId) {
                        invalidExport = export_

                        return false
                    }
                    return true
                })

                if (!isValidAllExport) {
                    reject(messageCreater(-1, 'error', `No permission to confirm export with id ${invalidExport.id}`))
                    return
                }

                // Find All sender id
                const allSenderId = []
                exportsDB.forEach((export_) => {
                    if (!allSenderId.includes(export_.partnerSenderId)) {
                        allSenderId.push(export_.partnerSenderId)
                    }
                })

                if (allSenderId.length === 0) {
                    reject(messageCreater(-1, 'error', `Already confirm all`))
                    return
                }

                // Load senders inf from db
                const partnersDB = await db.Partners.findAll({
                    where: {
                        id: {
                            [Op.or]: allSenderId
                        }
                    }
                })

                // This partner inf
                const thisPartner = await db.Partners.findByPk(partnerId, {
                    attributes: ['id', 'name', 'email', 'phone', 'address', 'role']
                })

                // some inf to send emails to senders
                const mapIdToPartner = {} // Map partnerId to partner
                const mapIdToExports = {} // Map partnerId to exports
                partnersDB.forEach((partner) => {
                    mapIdToPartner[partner.id] = partner
                    mapIdToExports[partner.id] = []
                })
                exportsDB.forEach((export_) => {
                    mapIdToExports[export_.partnerSenderId].push(export_)
                })

                // Update exports
                exportsDB.forEach(async (export_) => {
                    export_.confirm = true
                    await export_.save()
                })

                // Update product Holders
                const listProductId = []
                exportsDB.forEach((export_) => {
                    listProductId.push(export_.productId)
                })
                const productHolders = await db.ProductHolders.findAll({
                    where: {
                        productId: {
                            [Op.or]: listProductId
                        }
                    }
                })
                productHolders.forEach(async (holder) => {
                    holder.partner1Id = partnerId
                    holder.partner2Id = -1
                    await holder.save()
                })

                // Send email to senders
                partnersDB.forEach((partner) => {
                    // Send email
                    const relatedExports = mapIdToExports[partner.id]
                    mailServices.sendMailWithForm(
                        'recieved-product-notification.ejs',
                        {
                            toPartner: partner,
                            fromPartner: thisPartner,
                            exports: relatedExports
                        },
                        partner.email,
                        `${thisPartner.name} confirm recieved products`
                    )
                })

                // Send email to customer
                // Do somethings

                // Create messages and up to database
                partnersDB.forEach(async (partner) => {
                    const listId = []
                    const relatedExports = mapIdToExports[partner.id]
                    relatedExports.forEach((export_) => {
                        listId.push(export_.productId)
                    })
                    const content = {
                        type: 'EXPORT_CONFIRM_NOTIFICATION',
                        from: thisPartner,
                        listId: listId,
                        exports: relatedExports,
                        date: new Date()
                    }
                    // Create message form
                    const messageForm = {
                        partnerId: partner.id,
                        content: JSON.stringify(content),
                        date: new Date(),
                    }
                    const messageDB = await db.Messages.create(messageForm)
                    const messagePing = {
                        id: messageDB.id,
                        date: messageForm.date,
                        content: content
                    }
                    // Ping message to client
                    pingSocket(partner.id, messagePing, messageTitles.NEW_MESSAGE)
                })

                resolve(messageCreater(1, 'success', `Confirm exports successful!`))

            } catch (error) {
                console.log(error)
                reject(messageCreater(-2, 'error', error.message))
            }
        }).catch((error) => {
            // Token error
            reject(messageCreater(-2, 'error', `Authentication failed: ${error.name}`))
        })
    })
}

async function returnProductsToCustomer({ productIds, note = null }, token) {
    return new Promise(async (resolve, reject) => {
        await authenticationServices.verifyToken(token).then(async (message) => {
            // Account not active
            if (message.data.data.status === 1) {
                reject(messageCreater(-7, 'error', `Account not active. Please active your account`))
                return
            }

            // Account is cancel
            if (message.data.data.status === 0) {
                reject(messageCreater(-8, 'error', `Account is cancel`))
                return
            }

            // Only dealer
            if (message.data.data.role !== 3) {
                reject(messageCreater(-3, 'error', `Authentication failed: Not Permision`))
                return
            }

            const thisPartnerId = message.data.data.id

            try {
                // Get product holders information to check does product is now in dealer
                const productHoldersDB = await db.ProductHolders.findAll({
                    where: {
                        productId: {
                            [Op.or]: productIds
                        }
                    }
                })

                productHoldersDB.forEach((holder) => {
                    // Does product are in this dealer
                    if (holder.partner1Id !== thisPartnerId || holder.partner2Id !== -1) {
                        reject(messageCreater(-1, 'error', `No permission to return product with id ${holder.productId}`))
                        return
                    }
                })

                // Get informations about product and it's customer
                const productsDB = await db.Products.findAll({
                    where: {
                        id: {
                            [Op.or]: productIds
                        }
                    },
                    include: [
                        {
                            model: db.Purchases,
                            as: 'purchase',
                            include: [
                                {
                                    model: db.Customers,
                                    as: 'customer'
                                }
                            ]
                        }
                    ]
                })
                // Check does product have purchase
                productsDB.forEach((product) => {
                    if (!product?.purchase?.customer) {
                        reject(messageCreater(-1, 'error', `No permission to return product with id ${product.id}`))
                        return
                    }
                })

                // Create Exports
                const exportData = []
                productsDB.forEach((product) => {
                    const _export = {
                        productId: product.id,
                        partnerSenderId: thisPartnerId,
                        partnerRecieverId: product.purchase.customer.id,
                        date: new Date(),
                        type: 4,
                        note: note,
                        confirm: true
                    }
                    exportData.push(_export)
                })
                await db.Exports.bulkCreate(exportData)

                // Update status of product holder
                productHoldersDB.forEach(async (holder) => {
                    holder.partner1Id = -1
                    await holder.save()
                })

                // Send email to customers
                productsDB.forEach((product) => {
                    const customer = product.purchase.customer
                    mailServices.sendMailWithForm(
                        'return-product-notification.ejs',
                        {
                            product: product
                        },
                        customer.email,
                        'Sản phẩm đã được trả về cho quý khách, cảm ơn đã sử dụng dịch vụ của BigCorp'
                    )
                })

                resolve(messageCreater(1, 'success', `Return products successful!`))
            } catch (error) {
                console.log(error)
                reject(messageCreater(-2, 'error', error.message))
            }

        }).catch((error) => {
            // Token error
            reject(messageCreater(-2, 'error', `Authentication failed: ${error.name}`))
        })
    })
}


module.exports = {
    name: 'exportServices',
    findExportsByQuery,
    exportProducts,
    confirmExports,
    returnProductsToCustomer
}