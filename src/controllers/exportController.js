import { exportServices } from '../services/index'
import { messageCreater } from '../services/untilsServices'



/**
 * 
 * @param {Oject} req - An Object represent request  
 * @param {Object} res - An Object represent response
 * @returns {Message} - Return a messsage 
 */
async function getExportsByQuery(req, res) {
    // Check does token exists
    if (!req?.headers?.authorization) {
        return res.status(403).json(messageCreater(-4, 'error', 'Missing parameters: Token not found'))
    }

    const data = req.body
    if (!data) {
        return res.status(400).json(messageCreater(-3, 'error', 'Missing parameters'))
    }

    try {
        const message = await exportServices.findExportsByQuery(data, req.headers.authorization)
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

/**
 * 
 * @param {Oject} req - An Object represent request  
 * @param {Object} res - An Object represent response
 * @returns {Message} - Return a messsage 
 */
async function exportProducts(req, res) {
    // Check does token exists
    if (!req?.headers?.authorization) {
        return res.status(403).json(messageCreater(-4, 'error', 'Missing parameters: Token not found'))
    }

    // Check enough parameters 
    // console.log(typeof (req.body.products))
    if (!req?.body?.listId || !req?.body?.toPartnerId) {
        return res.status(400).json(messageCreater(-3, 'error', 'Missing parameters'))
    }

    // Export products
    try {
        let listId = req.body.listId
        const token = req.headers.authorization

        if (listId.length === 0) {
            return res.status(400).json(messageCreater(-3, 'error', 'Length array of products must larger than 0'))
        }

        const message = await exportServices.exportProducts(req.body, token)
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
async function confirmExportProducts(req, res) {
    // Check does token exists
    if (!req?.headers?.authorization) {
        return res.status(403).json(messageCreater(-4, 'error', 'Missing parameters: Token not found'))
    }

    // Check enough parameters 
    // console.log(typeof (req.body.products))
    if (!req?.body?.exportIds) {
        return res.status(400).json(messageCreater(-3, 'error', 'Missing parameters'))
    }

    // Confirm Export products
    try {
        let exportIds = req.body.exportIds
        const token = req.headers.authorization

        if (exportIds.length === 0) {
            return res.status(400).json(messageCreater(-3, 'error', 'Length array of exportIds must larger than 0'))
        }
        const message = await exportServices.confirmExports(exportIds, token)
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

async function returnProductsToCustomer(req, res) {
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
        let productIds = req.body.productIds
        const note = req.body.note
        const token = req.headers.authorization

        if (productIds.length === 0) {
            return res.status(400).json(messageCreater(-3, 'error', 'Length array of productIds must larger than 0'))
        }
        const message = await exportServices.returnProductsToCustomer({ productIds, note }, token)
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
    name: 'exportController',
    getExportsByQuery,
    exportProducts,
    confirmExportProducts,
    returnProductsToCustomer
}