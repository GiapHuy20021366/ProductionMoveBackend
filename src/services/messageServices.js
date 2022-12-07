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
async function findMessagesByQuery(query, token) {
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
                const where = queryServices.parseQuery(query, db.Models, ['partnerId'])
                const page = query?.pageOffset?.offset
                const limit = query?.pageOffset?.limit

                where.partnerId = message.data.data.id

                const { count, rows } = await db.Messages.findAndCountAll({
                    where: where,
                    offset: page,
                    limit: limit,
                    order: [['createdAt', 'DESC']]
                }).catch((error) => {
                    console.log(error)
                    reject(messageCreater(-5, 'error', 'Database Error!'))
                })

                resolve(messageCreater(1, 'success', `Found ${rows.length} messages`, { count, rows }))
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
    name: 'messageServices',
    findMessagesByQuery
}