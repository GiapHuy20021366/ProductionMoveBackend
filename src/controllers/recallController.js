import { recallServices } from '../services/index'
import { messageCreater } from '../services/untilsServices'



/**
 * 
 * @param {Oject} req - An Object represent request  
 * @param {Object} res - An Object represent response
 * @returns {Message} - Return a messsage 
 */
async function getRecallsByQuery(req, res) {
    // Check does token exists
    if (!req?.headers?.authorization) {
        return res.status(403).json(messageCreater(-4, 'error', 'Missing parameters: Token not found'))
    }

    const data = req.body
    if (!data) {
        return res.status(400).json(messageCreater(-3, 'error', 'Missing parameters'))
    }

    try {
        const message = await recallServices.findRecallsByQuery(data, req.headers.authorization)
        return res.status(200).json(message)
    } catch (err) {
        // Error caused by client
        if (err.code === -1) {
            return res.status(401).json(err)
        }
        console.log(err)
        return res.status(500).json(err)
    }
}

async function recallProducts(req, res) {
    // Check does token exists
    if (!req?.headers?.authorization) {
        return res.status(403).json(messageCreater(-4, 'error', 'Missing parameters: Token not found'))
    }

    // Check enough parameters 
    if (!req?.body?.productIds) {
        return res.status(400).json(messageCreater(-3, 'error', 'Missing parameters'))
    }

    // Return products
    try {
        const productIds = req.body.productIds
        const note = req.body.note
        const token = req.headers.authorization

        if (productIds.length === 0) {
            return res.status(400).json(messageCreater(-3, 'error', 'Length array of productIds must larger than 0'))
        }
        const message = await recallServices.recallProducts({ productIds, note }, token)
        return res.status(200).json(message)
    } catch (err) {
        // Error caused by client
        if (err.code === -1 || err.code === -2) {
            return res.status(401).json(err)
        }
        // console.log(err)
        return res.status(500).json(err)
    }
}

module.exports = {
    name: 'recallController',
    getRecallsByQuery,
    recallProducts
}