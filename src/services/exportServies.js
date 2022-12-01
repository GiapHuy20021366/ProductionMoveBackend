import authenticationServices from './authenticationServices'
import db from '../models/index'
import { messageCreater } from './untilsServices'
import { Op } from 'sequelize'
import queryServices from './queryServices'







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

module.exports = {
    name: 'exportServices',
    findExportsByQuery
}