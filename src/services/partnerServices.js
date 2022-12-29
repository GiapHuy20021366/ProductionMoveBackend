import bcryptServices from '../services/bcryptServices'
import db from '../models/index'
import { messageCreater } from './untilsServices'
import authenticationServices from './authenticationServices'
import { Op } from 'sequelize'
import mailServices from './mailServices'
import ejs from 'ejs'
import queryServices from './queryServices'
import { resolve } from 'path'
const path = require('path')
const EJS_PATH = '../views'

/**
 * @typedef {Object} Partner
 * @property {string} userName - A string represent user name
 * @property {string} password - A string represent password of user name
 * 
 * @param {Partner} partner - An Object represent properties of partner
 * @type {Promise}
 */
async function loginPartner(partner) {
    return new Promise(async (resolve, reject) => {
        let partnerDB
        try {
            // Find partner on database
            partnerDB = await db.Partners.findOne({
                where: { userName: partner.userName }
            })
        } catch (error) {
            console.log(error)
            // Error occurs when query database
            reject(messageCreater(-5, 'error', 'Database Error!'))
        }
        // Found partner
        if (partnerDB) {
            await bcryptServices.compare(partner.password, partnerDB.password).then((message) => {
                // Generate token for authentication
                const token = authenticationServices.generateToken({
                    userName: partnerDB.userName,
                    status: partnerDB.status,
                    role: partnerDB.role,
                    id: partnerDB.id
                })
                resolve(messageCreater(1, 'success', 'Login successful!', {
                    token,
                    id: partnerDB.id,
                    name: partnerDB.name,
                    userName: partnerDB.userName,
                    email: partnerDB.email,
                    phone: partnerDB.phone,
                    address: partnerDB.address,
                    birth: partnerDB.birth,
                    status: partnerDB.status,
                    role: partnerDB.role
                }))
            }).catch((err) => {
                // Password incorrect
                if (err.code === -2) {
                    reject(messageCreater(-1, 'error', 'Password incorrect!'))
                } else {
                    // Error caused by server
                    reject(messageCreater(-6, 'error', 'Internal Server Error!'))
                }
            })
        } else {
            // Not found, partner doesn't exist on database
            reject(messageCreater(-2, 'error', "Username doesn't exist"))
        }
    })
}

/**
 * 
 * @param {Object} partner 
 * @param {string} token 
 * @returns {Promise}
 */
async function createPartner(partner, token) {
    return new Promise(async (resolve, reject) => {
        await authenticationServices.verifyToken(token).then(async (message) => {
            // Token valid, decoded data
            // Not admin
            if (message.data.data.role !== 1) {
                reject(messageCreater(-3, 'error', `Authentication failed: Not Permision`))
                return
            }

            // Admin
            // Check does not userName, email exist on database
            try {
                const partnerDB = await db.Partners.findOne({
                    where: {
                        [Op.or]: [
                            { userName: partner.userName },
                            { email: partner.email }
                        ]
                    }
                })

                // Partner attribute exist in database
                if (partnerDB) {
                    // Username existed
                    if (partnerDB.userName === partner.userName) {
                        reject(messageCreater(-2, 'error', 'Username existed'))
                    }
                    // Email existed
                    if (partnerDB.email === partner.email) {
                        reject(messageCreater(-1, 'error', 'Email existed'))
                    }
                    // Shutdown execute
                    return
                }

                // No partner exist in database, let create new
                // Hash password
                const hashPasswordMessage = await bcryptServices.hash(partner.password).catch((error) => {
                    // Error hash password
                    reject(messageCreater(-6, 'error', 'Internal Server Error!'))
                })
                // Hash failed!
                if (!hashPasswordMessage) {
                    return
                }

                // Hash success
                const newPartnerDB = await db.Partners.create({
                    name: partner.name ? partner.name : '',
                    userName: partner.userName,
                    password: hashPasswordMessage.data,
                    email: partner.email,
                    phone: partner.phone ? partner.phone : '',
                    address: partner.address ? partner.address : '',
                    birth: partner.birth ? partner.birth : null,
                    status: partner.status ? partner.status : 1,
                    role: partner.role,
                    createAt: new Date(),
                    updateAt: new Date()
                })

                // Success created

                resolve(messageCreater(1, 'success', 'Create partner successful!', { id: newPartnerDB.id }))

                // Send email 
                ejs.renderFile(path.resolve(__dirname, EJS_PATH, 'email-create-partner.ejs'),
                    {
                        email: newPartnerDB.email,
                        userName: newPartnerDB.userName,
                        password: partner.password
                    },
                    (error, html) => {
                        if (html) {
                            mailServices.sendSimpleEmail(
                                newPartnerDB.email,
                                'Product Move create an account for you',
                                html
                            ).then((message) => {
                                console.log(message)
                            }).catch((error) => {
                                console.log(error)
                            })
                        } else {
                            console.log(error)
                        }
                    }
                )
            } catch (error) {
                // Error occurs when query database
                console.log(error)
                reject(messageCreater(-5, 'error', 'Database Error!'))
            }
        }).catch((error) => {
            // Token error
            reject(messageCreater(-3, 'error', `Authentication failed: ${error.name}`))
        })
    })
}

/**
 * 
 * @param {Object} partner 
 * @param {string} token 
 * @returns {Promise}
 */
async function refreshToken(token) {
    return new Promise(async (resolve, reject) => {
        await authenticationServices.verifyToken(token).then(async (message) => {
            const token = authenticationServices.generateToken(message.data.data)
            resolve(messageCreater(1, 'success', 'Token refresh successful!', { token }))
        }).catch((error) => {
            // Token error
            reject(messageCreater(-3, 'error', `Authentication failed: ${error.name}`))
        })
    })
}

/**
 * 
 * @param {Object} query 
 * @param {string} token 
 * @returns {Promise}
 */
async function findPartnersByQuery(query, token) {
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
                const where = queryServices.parseQuery(query, db.Models)
                const page = query?.pageOffset?.offset
                const limit = query?.pageOffset?.limit
                const include = []
                const associates = query.associates
                if (associates) {
                    if (associates.warehouses) {
                        include.push({
                            model: db.Warehouses,
                            as: 'warehouses',
                        })
                    }
                }

                const { count, rows } = await db.Partners.findAndCountAll({
                    where: where,
                    include: include,
                    attributes: ['id', 'name', 'email', 'phone', 'address', 'role', 'userName', 'createdAt', 'updatedAt', 'status'],
                    offset: page,
                    limit: limit
                }).catch((error) => {
                    reject(messageCreater(-5, 'error', 'Database Error!'))
                })

                resolve(messageCreater(1, 'success', `Found ${rows.length} partners`, { count, rows }))
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

const getResources = async (resources, token) => {
    return new Promise(async (resolve, reject) => {
        await authenticationServices.verifyToken(token).then(async (message) => {
            const resData = {}
            if (resources?.holders) {
                const holders = resources.holders
                const holdersRes = {
                    agencies: [],
                    maintainCenters: [],
                    factories: []
                }
                resData.holders = holdersRes

                try {
                    const partnersDB = await db.Partners.findAll({
                        attributes: ['id', 'name', 'role']
                    })
                    partnersDB.forEach((partner) => {
                        switch (partner.role) {
                            case 2: {
                                if (holders.factory) {
                                    holdersRes.factories.push(partner)
                                }
                                break
                            }
                            case 3: {
                                if (holders.agency) {
                                    holdersRes.agencies.push(partner)
                                }
                                break
                            }
                            case 4: {
                                if (holders.maintainCenter) {
                                    holdersRes.maintainCenters.push(partner)
                                }
                                break
                            }
                        }
                    })
                } catch (error) {
                    console.log(error)
                }
            }

            if (resources?.modelAttributes) {
                const modelAttributes = resources.modelAttributes
                const modelsDB = await db.Models.findAll({
                    attributes: ['generation', 'bodyType', 'engineType', 'boostType', 'series']
                })
                const generations = []
                const bodyTypes = []
                const engineTypes = []
                const boostTypes = []
                const series = []

                const modelAttributesRes = {
                    generations, bodyTypes, engineTypes, boostTypes, series
                }
                resData.modelAttributes = modelAttributesRes

                modelsDB.forEach((model) => {
                    const { generation, bodyType, engineType, boostType } = model
                    const seri = model.series
                    if (generation && modelAttributes.generation && !generations.includes(generation)) {
                        generations.push(generation)
                    }
                    if (bodyType && modelAttributes.bodyType && !bodyTypes.includes(bodyType)) {
                        bodyTypes.push(bodyType)
                    }
                    if (engineType && modelAttributes.engineType && !engineTypes.includes(engineType)) {
                        engineTypes.push(engineType)
                    }
                    if (boostType && modelAttributes.boostType && !boostTypes.includes(boostType)) {
                        boostTypes.push(boostType)
                    }
                    if (seri && modelAttributes.series && !series.includes(seri)) {
                        series.push(seri)
                    }
                })


            }
            resolve(messageCreater(1, 'success', '', resData))
        }).catch((error) => {
            // Token error
            reject(messageCreater(-2, 'error', `Authentication failed: ${error.name}`))
        })
    })
}

module.exports = {
    name: 'partnerServices',
    loginPartner,
    createPartner,
    refreshToken,
    findPartnersByQuery,
    getResources
}