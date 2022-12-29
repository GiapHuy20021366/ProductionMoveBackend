import db from '../models/index'
import { Op } from 'sequelize'
import { messageCreater } from './untilsServices'
import authenticationServices from './authenticationServices'
import mailServices from './mailServices'

const soldProduct = async ({ productId, customer, note }, token) => {
    return new Promise(async (resolve, reject) => {
        await authenticationServices.verifyToken(token).then(async (message) => {
            const thisPartnerId = message.data.data.id
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

            // Only Factory can sold product
            if (message.data.data.role !== 3) {
                reject(messageCreater(-3, 'error', `Authentication failed: Not Permision`))
                return
            }

            try {
                const productHolderDB = await db.ProductHolders.findOne({
                    where: {
                        productId: productId
                    }
                })

                if (productHolderDB.customerId !== -1 || productHolderDB.partner1Id !== thisPartnerId || productHolderDB.partner2Id !== -1) {
                    reject(messageCreater(-1, 'error', `No permission to sold product: This product is no longer at this agency or sold`))
                    return
                }

                const productDB = await db.Products.findByPk(productId)
                if (!productDB) {
                    reject(messageCreater(-1, 'error', `No permission to sold product: This product is no longer existed before`))
                    return
                }

                let customerDB
                if (customer?.id) {
                    customerDB = await db.Customers.findByPk(customer?.id)
                    if (!customerDB) {
                        reject(messageCreater(-1, 'error', `No customer with id ${customer.id} found`))
                        return
                    }
                } else {
                    customerDB = await db.Customers.findOne({
                        where: {
                            cardId: customer.cardId
                        }
                    })
                }

                if (!customerDB) {
                    const newCustomer = await db.Customers.create(customer)
                    customerDB = { ...newCustomer }
                }

                await db.Purchases.create({
                    customerId: customer.id,
                    productId: productId,
                    date: Date.now(),
                    note: note,
                    partnerId: thisPartnerId
                })

                productHolderDB.customerId = customerDB.id
                productHolderDB.partner1Id = -1
                await productHolderDB.save()

                mailServices.sendSimpleEmail(
                    customerDB.email,
                    'Cảm ơn quý khách đã mua và ủng hộ sản phẩm tại các chuỗi đại lý của BigCorp',
                    'Cảm ơn quý khách đã mua sản phẩm tại đại lý thuộc sở hữu của BigCorp. Các thông tin cập nhật về sản phẩm bao sẽ được chúng tôi thông báo chi tiết qua địa chỉ email này.'
                )

                resolve(messageCreater(1, 'success', `Sold product successful`, {}))

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
    name: 'purchaseServices',
    soldProduct
}