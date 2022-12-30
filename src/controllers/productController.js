import { productServices } from '../services/index'
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
        for (let i in products) {
            if (!products[i].modelId) {
                return res.status(400).json(messageCreater(-3, 'error', `Missing parameters at index ${i}`))
            }
            if (!products[i].birth) {
                products[i].birth = new Date()
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
    // if (!req?.body?.listId) {
    //     return res.status(400).json(messageCreater(-3, 'error', 'Missing parameters'))
    // }

    // get infs products
    try {
        let listId = req?.body?.listId
        if (!listId) listId = []
        const token = req.headers.authorization
        const message = await productServices.getProductsByIds(listId, token)
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

/**
 * 
 * @param {Oject} req - An Object represent request  
 * @param {Object} res - An Object represent response
 * @returns {Message} - Return a messsage 
 */
async function getProductsByQuery(req, res) {
    // Check does token exists
    if (!req?.headers?.authorization) {
        return res.status(403).json(messageCreater(-4, 'error', 'Missing parameters: Token not found'))
    }

    const data = req.body
    if (!data) {
        return res.status(400).json(messageCreater(-3, 'error', 'Missing parameters'))
    }

    try {
        const message = await productServices.findProductsByQuery(data, req.headers.authorization)
        return res.status(200).json(message)
    } catch (err) {
        // Error caused by client
        if (err.code === -1) {
            return res.status(401).json(err)
        }
        return res.status(500).json(err)
    }
}

/**
 * 
 * @param {Oject} req - An Object represent request  
 * @param {Object} res - An Object represent response
 * @returns {Message} - Return a messsage 
 */
async function getCurrentLocationOfProducts(req, res) {
    // Check does token exists
    if (!req?.headers?.authorization) {
        return res.status(403).json(messageCreater(-4, 'error', 'Missing parameters: Token not found'))
    }

    try {
        let listId = req?.body?.listId
        if (!listId) listId = []
        const token = req.headers.authorization
        const message = await productServices.getCurrentLocationOfProducts(listId, token)
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

/**
 * 
 * @param {Oject} req - An Object represent request  
 * @param {Object} res - An Object represent response
 * @returns {Message} - Return a messsage 
 */
async function getCurrentProductsByQuery(req, res) {
    // Check does token exists
    if (!req?.headers?.authorization) {
        return res.status(403).json(messageCreater(-4, 'error', 'Missing parameters: Token not found'))
    }

    const data = req.body
    if (!data) {
        return res.status(400).json(messageCreater(-3, 'error', 'Missing parameters'))
    }

    try {
        const message = await productServices.getProductsCurrent(data, req.headers.authorization)
        return res.status(200).json(message)
    } catch (err) {
        // Error caused by client
        console.log(err)
        if (err.code === -1) {
            return res.status(401).json(err)
        }
        return res.status(500).json(err)
    }
}

async function getNewestExportsByIds(req, res) {
    // Check does token exists
    if (!req?.headers?.authorization) {
        return res.status(403).json(messageCreater(-4, 'error', 'Missing parameters: Token not found'))
    }

    const data = req.body
    if (!data || !data?.productIds) {
        return res.status(400).json(messageCreater(-3, 'error', 'Missing parameters'))
    }

    try {
        const message = await productServices.getExportsByIds(data.productIds, req.headers.authorization)
        return res.status(200).json(message)
    } catch (err) {
        // Error caused by client
        console.log(err)
        if (err.code === -1) {
            return res.status(401).json(err)
        }
        return res.status(500).json(err)
    }
}

module.exports = {
    name: 'productController',
    createProducts,
    getProductsByIds,
    getProductsByQuery,
    getCurrentLocationOfProducts,
    getCurrentProductsByQuery,
    getNewestExportsByIds
}