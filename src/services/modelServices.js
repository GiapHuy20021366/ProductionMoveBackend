import authenticationServices from './authenticationServices'
import db from '../models/index'
import { messageCreater } from './untilsServices'
import { Op } from 'sequelize'
import queryServices from './queryServices'

/**
 * 
 * @param {Model} model
 * @param {string} token 
 * @returns {import('./untilsServices').Message}
 */
async function createModel(model, token) {
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

            // Only Factory can create model
            if (message.data.data.role !== 2) {
                reject(messageCreater(-3, 'error', `Authentication failed: Not Permision`))
                return
            }

            // Check does model exist on database
            try {
                const modelDB = await db.Models.findOne({
                    where: {
                        name: model.name,
                        signName: model.signName
                    }
                })

                // Model existed on database
                if (modelDB) {
                    reject(messageCreater(-1, 'error', 'Model existed'))
                    return
                }

                // No model found, create model
                const newModelDB = await db.Models.create({
                    name: model.name,
                    signName: model.signName,
                    factoryId: message.data.data.id,
                    birth: model.birth ? model.birth : null,
                    generation: model.generation ? model.generation : null,
                    series: model.series ? model.series : null,
                    trim: model.trim ? model.trim : null,
                    bodyType: model.bodyType ? model.bodyType : null,
                    numberOfSeats: model.numberOfSeats ? model.numberOfSeats : null,
                    length: model.length ? model.length : null,
                    width: model.width ? model.width : null,
                    height: model.height ? model.height : null,
                    engineType: model.engineType ? model.engineType : null,
                    boostType: model.boostType ? model.boostType : null,
                    maxSpeed: model.maxSpeed ? model.maxSpeed : null,
                    accceleration: model.accceleration ? model.accceleration : null,
                    cityFuel: model.cityFuel ? model.cityFuel : null
                })

                resolve(messageCreater(1, 'success', 'Create model successful!', newModelDB))

            } catch (error) {
                // Error occurs when query database
                console.log(error)
                reject(messageCreater(-5, 'error', 'Database Error!'))
            }

        }).catch((error) => {
            // Token error
            reject(messageCreater(-2, 'error', `Authentication failed: ${error.name}`))
        })
    })
}

async function getListModel(listId, token) {
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
            // Get infs of models
            try {
                const modelsDB = await db.Models.findAll({
                    where: {
                        id: {
                            [Op.or]: listId
                        }
                    },
                    include: [
                        {
                            model: db.Partners,
                            as: 'factory',
                            attributes: ['id', 'name', 'email', 'phone', 'address', 'role']
                        }
                    ]
                })
                resolve(messageCreater(1, 'success', `Found ${modelsDB.length} models`, modelsDB))
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
async function findModelsByQuery(query, token) {
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
                    if (associates.factory) {
                        include.push({
                            model: db.Partners,
                            as: 'factory',
                            attributes: ['id', 'name', 'email', 'phone', 'address', 'role']
                        })
                    }
                }

                const { count, rows } = await db.Models.findAndCountAll({
                    where: where,
                    include: include,
                    offset: page,
                    limit: limit
                }).catch((error) => {
                    reject(messageCreater(-5, 'error', 'Database Error!'))
                })

                resolve(messageCreater(1, 'success', `Found ${rows.length} models`, { count, rows }))
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
    name: 'modelServices',
    createModel,
    getListModel,
    findModelsByQuery
}