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

                // Create products
                const productsDB = await db.Products.bulkCreate(products, { returning: true })
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
                            as: 'purchare',
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
                }

                const { count, rows } = await db.Products.findAndCountAll({
                    where: where,
                    include: include,
                    offset: page,
                    limit: limit
                }).catch((error) => {
                    // console.log(error)
                    reject(messageCreater(-5, 'error', 'Database Error!'))
                })

                resolve(messageCreater(1, 'success', `Found ${rows.length} products`, { count, rows }))
            } catch (error) {
                // console.log(error)
                reject(messageCreater(-2, 'error', error.message))
            }

        }).catch((error) => {
            // Token error
            reject(messageCreater(-2, 'error', `Authentication failed: ${error.name}`))
        })
    })
}



module.exports = {
    name: 'productServices',
    createProducts,
    getProductsByIds,
    findProductsByQuery
}