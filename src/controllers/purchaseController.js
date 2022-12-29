'use strict'
import { messageCreater } from '../services/untilsServices'
import { purchaseServices } from '../services/index'




/**
 * 
 * @param {Oject} req - An Object represent request  
 * @param {Object} res - An Object represent response
 * @returns {Message} - Return a messsage 
 */
async function soldProduct(req, res) {
    // Check does token exists
    if (!req?.headers?.authorization) {
        return res.status(403).json(messageCreater(-4, 'error', 'Missing parameters: Token not found'))
    }

    // Check enough parameters 
    if (!req?.body?.productId) {
        return res.status(400).json(messageCreater(-3, 'error', 'Missing parameter productId'))
    }

    if (!req?.body?.customer) {
        return res.status(400).json(messageCreater(-3, 'error', 'Missing customer data'))
    } else {
        const customer = req.body.customer
        if (!customer?.id && (!customer?.name || !customer?.email || !customer.cardId)) {
            return res.status(400).json(messageCreater(-3, 'error', 'Missing parameters of data of customer'))
        }
    }
    // Sold product
    try {
        const message = await purchaseServices.soldProduct(req.body, req.headers.authorization)
        return res.status(200).json(message)
    } catch (err) {
        // Error caused by client, username or password incorrect
        if (err.code === -1 || err.code === -2) {
            return res.status(401).json(err)
        }
        console.log(err)
        return res.status(500).json(err)
    }
}






module.exports = {
    name: 'purchaseController',
    soldProduct
}