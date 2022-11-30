import productServices from '../services/productServices'
import { messageCreater } from '../services/untilsServices'
/**
 * 
 * @param {Oject} req - An Object represent request  
 * @param {Object} res - An Object represent response
 * @returns {Message} - Return a messsage 
 */
async function createProducts(req, res) {
    // Check does token exists
    if (!req?.headers?.authorization) {
        return res.status(403).json(messageCreater(-4, 'error', 'Missing parameters: Token not found'))
    }

    // Check enough parameters 
    // console.log(typeof (req.body.products))
    if (!req?.body?.products) {
        return res.status(400).json(messageCreater(-3, 'error', 'Missing parameters'))
    }

    // Create products
    try {
        let products = req.body.products
        const token = req.headers.authorization
        // if (typeof (products) == 'string') {
        //     products = JSON.parse(products)
        // }
        if (products.length === 0) {
            return res.status(400).json(messageCreater(-3, 'error', 'Length array of products must larger than 0'))
        }
        for (let i in req.body.products) {
            if (!products[i].modelId) {
                return res.status(400).json(messageCreater(-3, 'error', `Missing parameters at index ${i}`))
            }
        }

        const message = await productServices.createProducts(products, token)
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

async function getProductsByIds(req, res) {
    // Check does token exists
    if (!req?.headers?.authorization) {
        return res.status(403).json(messageCreater(-4, 'error', 'Missing parameters: Token not found'))
    }

    // Check enough parameters 
    // console.log(typeof (req.body.products))
    if (!req?.body?.listId) {
        return res.status(400).json(messageCreater(-3, 'error', 'Missing parameters'))
    }

    // get infs products
    try {
        let listId = req.body.listId
        const token = req.headers.authorization
        const message = await productServices.getProductsByIds(listId, token)
        return res.status(200).json(message)
    } catch (error) {
        // Error caused by client
        if (err.code === -1 || err.code === -2) {
            return res.status(401).json(err)
        }
        // console.log(err)
        return res.status(500).json(err)
    }

}

module.exports = {
    createProducts,
    getProductsByIds
}