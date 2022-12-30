import db from '../models/index'
import { Op } from 'sequelize'
import { messageCreater } from './untilsServices'
import authenticationServices from './authenticationServices'
import queryServices from './queryServices'

/**
 * 
 * @param {Array} products 
 * @type {Promise}
 */
async function createProducts(products, token) {
    return new Promise(async (resolve, reject) => {
        const listModelId = []
        for (let product of products) {
            listModelId.push(product.modelId)
            if (!product.birth) {
                product.birth = Date.now()
            }
        }

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

            // Only Factory can create product
            if (message.data.data.role !== 2) {
                reject(messageCreater(-3, 'error', `Authentication failed: Not Permision`))
                return
            }

            // Check permission for create model
            try {
                // Find models Infomartion
                // console.log(listModelId)
                const modelsDB = await db.Models.findAll({
                    where: {
                        id: {
                            [Op.or]: listModelId
                        }
                    }
                })
                // console.log(modelsDB)
                const modelIdToFactoryId = {}
                for (let model of modelsDB) {
                    modelIdToFactoryId[model.id] = model.factoryId
                }
                // Check if modelId not found or no permission to create product
                for (let index in products) {
                    if (!modelIdToFactoryId[products[index].modelId]) {
                        reject(messageCreater(-1, 'error', `No model id found for product at index ${index}`))
                        return
                    }
                    if (modelIdToFactoryId[products[index].modelId] !== message.data.data.id) {
                        reject(messageCreater(-1, 'error', `No permission to create product at index ${index}`))
                        return
                    }
                }

                // products.forEach((product))

                // Create products
                const productsDB = await db.Products.bulkCreate(products, { returning: true })
                const productHolders = []
                productsDB.forEach((product) => {
                    const factoryId = modelIdToFactoryId[product.modelId]
                    const productId = product.id
                    productHolders.push({
                        productId: productId,
                        partner1Id: factoryId,
                        partner2Id: -1,
                        customerId: -1
                    })
                })
                const productHoldersDB = await db.ProductHolders.bulkCreate(productHolders, { returning: true })
                // Success created
                resolve(messageCreater(1, 'success', 'Create products successful!', productsDB))
            } catch (error) {
                console.log(error)
                reject(messageCreater(-5, 'error', 'Database Error!'))
            }

        }).catch((error) => {
            // Token error
            reject(messageCreater(-2, 'error', `Authentication failed: ${error.name}`))
        })
    })
}

/**
 * 
 * @param {Array} listId 
 * @type {Promise}
 */
async function getProductsByIds(listId, token) {
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
                const productsDB = await db.Products.findAll({
                    where: {
                        id: {
                            [Op.or]: listId
                        }
                    },
                    include: [
                        {
                            model: db.Models,
                            as: 'model',
                            include: [
                                {
                                    model: db.Partners,
                                    as: 'factory',
                                    attributes: ['id', 'name', 'email', 'phone', 'address', 'role']
                                }
                            ]
                        }
                    ]
                })
                resolve(messageCreater(1, 'success', 'Get products successful!', productsDB))
            } catch (error) {
                console.log(error)
                reject(messageCreater(-5, 'error', 'Database Error!'))
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
async function findProductsByQuery(query, token) {
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
                    // Include model info
                    if (associates.model) {
                        const modelAssociate = {
                            model: db.Models,
                            as: 'model',
                        }
                        include.push(modelAssociate)
                        // Include factory infor
                        if (associates.model?.factory) {
                            modelAssociate.include = [
                                {
                                    model: db.Partners,
                                    as: 'factory',
                                    attributes: ['id', 'name', 'email', 'phone', 'address', 'role']
                                }
                            ]
                        }
                    }

                    // Include purchase infor
                    if (associates.purchase) {
                        const purchaseAssociate = {
                            model: db.Purchases,
                            as: 'purchase',
                        }
                        include.push(purchaseAssociate)
                        // Include customer infor
                        if (associates.purchase?.customer) {
                            purchaseAssociate.include = [
                                {
                                    model: db.Customers,
                                    as: 'customer'
                                }
                            ]
                        }
                        if (associates.purchase?.dealer) {
                            purchaseAssociate.include.push({
                                model: db.Partners,
                                as: 'dealer',
                                attributes: ['id', 'name', 'email', 'phone', 'address', 'role']
                            })
                        }
                    }

                    // Include exports infor
                    if (associates.exports) {
                        const exportAssociate = {
                            model: db.Exports,
                            as: 'exports'
                        }
                        include.push(exportAssociate)
                        // Include sender
                        if (associates.exports?.sender) {
                            const senderAssociate = {
                                model: db.Partners,
                                as: 'sender',
                                attributes: ['id', 'name', 'email', 'phone', 'address', 'role']
                            }
                            exportAssociate.include = [senderAssociate]
                        }
                        if (associates.exports?.reciever) {
                            const recieverAssociate = {
                                model: db.Partners,
                                as: 'reciever',
                                attributes: ['id', 'name', 'email', 'phone', 'address', 'role']
                            }
                            exportAssociate.include.push(recieverAssociate)
                        }
                    }

                    //Include recalls infor
                    if (associates.recalls) {
                        const recallAssociate = {
                            model: db.Recalls,
                            as: 'recalls'
                        }
                        include.push(recallAssociate)
                    }

                    // Include maintains infor
                    if (associates.maintains) {
                        const maintainAssociate = {
                            model: db.Maintains,
                            as: 'maintains'
                        }
                        include.push(maintainAssociate)
                    }

                    // Include holders infor
                    if (associates.holders) {
                        const holdersAssociate = {
                            model: db.ProductHolders,
                            as: 'holders',
                            include: [
                                {
                                    model: db.Partners,
                                    as: 'nowAt',
                                    attributes: ['id', 'name', 'email', 'phone', 'address', 'role']
                                },
                                {
                                    model: db.Partners,
                                    as: 'willAt',
                                    attributes: ['id', 'name', 'email', 'phone', 'address', 'role']
                                },
                                {
                                    model: db.Customers,
                                    as: 'customer'
                                }
                            ]
                        }
                        include.push(holdersAssociate)
                    }
                }

                const { count, rows } = await db.Products.findAndCountAll({
                    where: where,
                    include: include,
                    offset: page,
                    limit: limit
                }).catch((error) => {
                    console.log(error)
                    reject(messageCreater(-5, 'error', 'Database Error!'))
                })

                resolve(messageCreater(1, 'success', `Found ${rows.length} products`, { count, rows }))
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
 * @param {Array} productDetails 
 * @return {Array}
 */
function lastLocations(productDetails) {
    const result = []
    productDetails.forEach((product) => {
        let lastLocationDetail = {}
        // When beginning born
        lastLocationDetail = {
            title: 'FACTORY',
            onBorn: true,
            factory: product?.model?.factory,
            date: product?.birth
        }

        // When purchase
        if (product?.purchase) {
            const purchase = product.purchase
            if (purchase.date > lastLocationDetail.date) {
                lastLocationDetail = {
                    title: 'CUSTOMER',
                    customer: purchase?.customer,
                    date: purchase.date,
                    onSelled: true
                }
            }

        }

        // When exports
        if (product?.exports.length > 0) {
            const lastExport = product.exports[0]
            if (lastExport.date > lastLocationDetail.date) {
                switch (lastExport.type) {
                    case 4: // Return to customer
                        lastLocationDetail = {
                            title: 'CUSTOMER',
                            customer: product?.purchase?.customer,
                            type: lastExport.type,
                            date: lastExport.date
                        }
                        break
                    case 1:
                    case 2:
                    case 3:
                        lastLocationDetail = {
                            title: 'MOVE',
                            sender: lastExport.sender,
                            reciever: lastExport.reciever,
                            moving: !lastExport.confirm,
                            type: lastExport.type,
                            date: lastExport.date
                        }
                        break
                    default: break
                }
            }
        }

        // When maintains
        if (product?.maintains.length > 0) {
            const lastMaintain = product.maintains[0]
            if (lastMaintain.date > lastLocationDetail.date) {
                lastLocationDetail = {
                    title: 'DEALER',
                    onMaintaining: true,
                    date: lastMaintain.date,
                    dealer: product.purchase.dealer
                }
            }
        }

        // When recalls
        if (product?.recalls.length > 0) {
            const lastRecall = product.recalls[0]
            if (lastRecall.date > lastLocationDetail.date) {
                lastLocationDetail = {
                    title: 'DEALER',
                    onRecalling: true,
                    date: lastRecall.date,
                    dealer: product.purchase.dealer
                }
            }
        }

        lastLocationDetail.productId = product.id
        result.push(lastLocationDetail)
    })
    return result

}

/**
 * 
 * @param {Array} listId 
 * @return {Promise}
 */
async function getCurrentLocationOfProducts(listId, token) {
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

            // Only admin
            if (message.data.data.role !== 1) {
                reject(messageCreater(-3, 'error', `Authentication failed: Not Permision`))
                return
            }

            try {
                // Get info products
                const productsDB = await db.ProductHolders.findAll({
                    where: {
                        productId: {
                            [Op.or]: listId
                        }
                    },
                    include: [
                        {
                            model: db.Customers,
                            as: 'customer'
                        },
                        {
                            model: db.Partners,
                            as: 'nowAt',
                            attributes: ['id', 'name', 'email', 'phone', 'address', 'role']
                        },
                        {
                            model: db.Partners,
                            as: 'willAt',
                            attributes: ['id', 'name', 'email', 'phone', 'address', 'role']
                        }
                    ],
                    // raw: true,
                    // nest: true
                })
                // console.log(productsDB)
                // const result = lastLocations(productsDB)
                // console.log(result)

                resolve(messageCreater(1, 'success', 'Get locations successful!', productsDB))
            } catch (error) {
                console.log(error)
                reject(messageCreater(-5, 'error', 'Database Error!'))
            }

        }).catch((error) => {
            // Token error
            reject(messageCreater(-2, 'error', `Authentication failed: ${error.name}`))
        })
    })

}

/**
 * 
 */
async function getProductsCurrent(query, token) {
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

            const partnerId = message.data.data.id
            const role = message.data.data.role
            const permitQuery = { ...query }
            let lookId = -1

            // Deny querying on global operations
            if (permitQuery?.operations) permitQuery.operations = {}
            if (permitQuery?.attributes) permitQuery.attributes = {}

            // Just admin or self partner
            if (query.partnerId) {
                if (query.partnerId !== partnerId && role !== 1) {
                    reject(messageCreater(-3, 'error', `Authentication failed: Not Permision`))
                    return
                } else {
                    lookId = query.partnerId
                }
            } else {
                lookId = partnerId
            }

            const soldProducts = []
            if (role === 3) {
                const purchasesDB = await db.Purchases.findAll({
                    where: {
                        partnerId: partnerId
                    },
                    attributes: ['productId']
                })
                purchasesDB.forEach((purchase) => {
                    soldProducts.push(purchase.productId)
                })
                // where.productId = {
                //     [Op.or]: soldProducts
                // }
            }

            permitQuery.operations = {
                or: [
                    {
                        partner1Id: lookId
                    },
                    {
                        partner2Id: lookId
                    }
                ]
            }
            soldProducts.forEach((productId) => {
                permitQuery.operations.or.push({
                    productId: productId
                })
            })
            // console.log(permitQuery)
            const where = queryServices.parseQuery(permitQuery, db.ProductHolders)
            // console.log(where)
            const page = query?.pageOffset?.offset
            const limit = query?.pageOffset?.limit
            const include = []
            const associates = query.associates
            if (associates) {
                // Include product inf
                if (associates?.product) {
                    const productAssociate = {
                        model: db.Products,
                        as: 'product',
                        include: []
                    }
                    include.push(productAssociate)
                    // Include model inf
                    if (associates.product?.model) {
                        const modelAssociate = {
                            model: db.Models,
                            as: 'model',
                            include: []
                        }
                        productAssociate.include.push(modelAssociate)

                        // Include factory inf
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

                // Include customer inf
                if (associates?.customer) {
                    const customerAssociate = {
                        model: db.Customers,
                        as: 'customer'
                    }
                    include.push(customerAssociate)
                }

                // Include nowAt
                if (associates?.nowAt) {
                    const nowAtAssociate = {
                        model: db.Partners,
                        as: 'nowAt',
                        attributes: ['id', 'name', 'email', 'phone', 'address', 'role']
                    }
                    include.push(nowAtAssociate)
                }

                // Include willAt
                if (associates?.willAt) {
                    const willAtAssociate = {
                        model: db.Partners,
                        as: 'willAt',
                        attributes: ['id', 'name', 'email', 'phone', 'address', 'role']
                    }
                    include.push(willAtAssociate)
                }
            }



            // console.log(where)
            const { count, rows } = await db.ProductHolders.findAndCountAll({
                where: where,
                include: include,
                offset: page,
                limit: limit
            }).catch((error) => {
                console.log(error)
                reject(messageCreater(-5, 'error', 'Database Error!'))
            })

            // // Dealer get Infor about sold product
            // if (role === 3) {

            // }


            resolve(messageCreater(1, 'success', `Found ${rows.length} products`, { count, rows }))


        }).catch((error) => {
            // Token error
            console.log(error)
            reject(messageCreater(-2, 'error', `Authentication failed: ${error.name}`))
        })
    })
}


async function getExportsByIds(ids, token) {
    return new Promise(async (resolve, reject) => {
        await authenticationServices.verifyToken(token).then(async (message) => {
            // Token valid, decoded data
            // Not admin
            if (message.data.data.role === 1) {
                reject(messageCreater(-3, 'error', `Authentication failed: Not Permision`))
                return
            }

            const exportsDB = await db.Exports.findAll({
                where: {
                    productId: {
                        [Op.or]: ids
                    }
                },
                order: [
                    ['date', 'ASC'],
                ],
            })

            const mapIdToExports = {}
            exportsDB.forEach((export_) => {
                mapIdToExports[export_.productId] = export_.id
            })

            resolve(messageCreater(1, 'success', 'Get newest export successful', mapIdToExports))

        }).catch((error) => {
            // Token error
            reject(messageCreater(-3, 'error', `Authentication failed: ${error.name}`))
        })
    })
}





module.exports = {
    name: 'productServices',
    getCurrentLocationOfProducts,
    createProducts,
    getProductsByIds,
    findProductsByQuery,
    getProductsCurrent,
    getExportsByIds
}