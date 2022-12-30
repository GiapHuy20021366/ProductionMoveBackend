import authenticationServices from './authenticationServices'
import db from '../models/index'
import { messageCreater } from './untilsServices'
import { Op } from 'sequelize'
import queryServices from './queryServices'
import mailServices from './mailServices'






/**
 * 
 * @param {Object} query 
 * @param {string} token 
 * @returns {Promise}
 */
async function findRecallsByQuery(query, token) {
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

                        // purchase
                        if (associates.product?.purchase) {
                            const purchaseAssociate = {
                                model: db.Purchases,
                                as: 'purchase',
                                include: []
                            }
                            productAssociate.include.push(purchaseAssociate)

                            // customer
                            if (associates.product.purchase?.customer) {
                                const customerAssociate = {
                                    model: db.Customers,
                                    as: 'customer'
                                }
                                purchaseAssociate.include.push(customerAssociate)
                            }

                            // dealer
                            if (associates.product.purchase?.dealer) {
                                const dealerAssociate = {
                                    model: db.Partners,
                                    as: 'dealer',
                                    attributes: ['id', 'name', 'email', 'phone', 'address', 'role']
                                }
                                purchaseAssociate.include.push(dealerAssociate)
                            }
                        }
                    }
                }

                const { count, rows } = await db.Recalls.findAndCountAll({
                    where: where,
                    include: include,
                    offset: page,
                    limit: limit
                }).catch((error) => {
                    console.log(error)
                    reject(messageCreater(-5, 'error', 'Database Error!'))
                })

                resolve(messageCreater(1, 'success', `Found ${rows.length} recalls`, { count, rows }))
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

async function recallProducts({ productIds, note = null }, token) {
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
                // Get product holders information to check does product is now in customer
                const productHoldersDB = await db.ProductHolders.findAll({
                    where: {
                        productId: {
                            [Op.or]: productIds
                        }
                    }
                })

                productHoldersDB.forEach((holder) => {
                    // Not in customer, or not selled
                    if (holder.partner1Id !== -1 || holder.customerId === -1) {
                        reject(messageCreater(-1, 'error', `No permission to recall product with id ${holder.productId}`))
                        return
                    }
                })

                // Get information of products
                const productDBs = await db.Products.findAll({
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
                                },
                                {
                                    model: db.Partners,
                                    as: 'dealer'
                                }
                            ]
                        }
                    ]
                })

                // Check does products sell by this dealer
                productDBs.forEach((product) => {
                    // This product is not selled by this dealer
                    if (product.purchase.dealer.id !== thisPartnerId) {
                        reject(messageCreater(-1, 'error', `No permission to recall product with id ${product.id}`))
                        return
                    }
                })

                // Insert maintain info into maintain table
                const recallDatas = []
                productDBs.forEach((product) => {
                    const recallData = {
                        productId: product.id,
                        date: new Date(),
                        note: note
                    }
                    recallDatas.push(recallData)
                })
                // Save maintainDatas
                const recallsDB = await db.Recalls.bulkCreate(recallDatas, { returning: true })

                // Save status of product holders
                productHoldersDB.forEach(async (holder) => {
                    holder.partner1Id = thisPartnerId
                    await holder.save()
                })

                // Send mail to customer
                productDBs.forEach((product) => {
                    const customer = product.purchase.customer
                    mailServices.sendMailWithForm(
                        'recall-confirm-notification.ejs',
                        {
                            product: product
                        },
                        customer.email,
                        'Cảm ơn quý khách đã tuân theo chính sách thu hồi sản phẩm lỗi của BigCorp, chúng tôi sẽ thực hiện các hành động hoàn trả sớm nhất có thể'
                    )
                })

                resolve(messageCreater(1, 'success', `Recall products confirm successful`, recallsDB))

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
    name: 'recallServices',
    findRecallsByQuery,
    recallProducts
}