import db from '../models/index'
import { Op } from 'sequelize'
import { messageCreater } from './untilsServices'
import authenticationServices from './authenticationServices'
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


module.exports = {
    createProducts,
    getProductsByIds
}