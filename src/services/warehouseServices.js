import db from '../models/index'
import { messageCreater } from './untilsServices'
import authenticationServices from './authenticationServices'

/**
 * @typedef {Object} Warehouse
 * @property {string} name
 * @property {string} address
 * @property {number} partnerId
 */
/**
 * @param {Warehouse} warehouse
 * @param {string} token
 */
async function createWarehouse(warehouse, token) {
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
            if (message.data.data.role !== 3) {
                reject(messageCreater(-3, 'error', `Authentication failed: Not Permision`))
                return
            }

            // Check does model exist on database
            try {
                const warehouseDB = await db.Warehouses.findOne({
                    where: {
                        name: warehouse.name,
                        partnerId: message.data.data.id
                    }
                })

                // Model existed on database
                if (warehouseDB) {
                    reject(messageCreater(-1, 'error', 'Name of warehouse existed'))
                    return
                }

                // No warehouse name found, create warehouse
                const newWarehouseDB = await db.Warehouses.create({
                    name: warehouse.name,
                    address: warehouse.address,
                    partnerId: message.data.data.id
                })

                resolve(messageCreater(1, 'success', 'Create warehouse successful!'))

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

module.exports = {
    createWarehouse
}