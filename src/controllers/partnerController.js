'use strict'
import { messageCreater } from '../services/untilsServices'
import { partnerServices } from '../services/index'

/**
 * 
 * @param {Oject} req - An Object represent request  
 * @param {Object} res - An Object represent response
 * @returns {Message} - Return a messsage 
 */
async function partnerLogin(req, res) {
    // Check enough parameters 
    if (!req?.body?.userName || !req?.body?.password) {
        return res.status(400).json(messageCreater(-3, 'error', 'Missing parameters'))
    }
    // Login partner
    try {
        const message = await partnerServices.loginPartner(req.body)
        return res.status(200).json(message)
    } catch (err) {
        // Error caused by client, username or password incorrect
        if (err.code === -1 || err.code === -2) {
            return res.status(401).json(err)
        }
        return res.status(500).json(err)
    }
}

/**
 * @param {Oject} req - An Object represent request  
 * @param {Object} res - An Object represent response
 * @returns {Message} - Return a messsage 
 */
async function createPartner(req, res) {

    // Check does token exists
    if (!req?.headers?.authorization) {
        return res.status(403).json(messageCreater(-4, 'error', 'Missing parameters: Token not found'))
    }
    // Check enough parameters
    const data = req.body
    if (!data || !data.userName || !data.password || !data.email || !data.role) {
        return res.status(400).json(messageCreater(-3, 'error', 'Missing parameters'))
    }

    // Create partner
    try {
        const message = await partnerServices.createPartner(data, req.headers.authorization)

        return res.status(200).json(message)
    } catch (err) {
        // Error caused by client, username or password existed
        if (err.code === -1 || err.code === -2) {
            return res.status(401).json(err)
        }
        if (err.code === -3) {
            return res.status(403).json(err)
        }
        return res.status(500).json(err)
    }
}

async function refreshToken(req, res) {
    // Check does token exists
    if (!req?.headers?.authorization) {
        return res.status(403).json(messageCreater(-4, 'error', 'Missing parameters: Token not found'))
    }
    try {
        const message = await partnerServices.refreshToken(req.headers.authorization)
        return res.status(200).json(message)
    } catch (err) {
        if (err.code === -3) {
            return res.status(403).json(err)
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
async function getPartnersByQuery(req, res) {
    // Check does token exists
    if (!req?.headers?.authorization) {
        return res.status(403).json(messageCreater(-4, 'error', 'Missing parameters: Token not found'))
    }

    const data = req.body
    if (!data) {
        return res.status(400).json(messageCreater(-3, 'error', 'Missing parameters'))
    }

    try {
        const message = await partnerServices.findPartnersByQuery(data, req.headers.authorization)
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
async function getResources(req, res) {
    // Check does token exists
    if (!req?.headers?.authorization) {
        return res.status(403).json(messageCreater(-4, 'error', 'Missing parameters: Token not found'))
    }

    const data = req.body
    if (!data) {
        return res.status(400).json(messageCreater(-3, 'error', 'Missing parameters'))
    }

    try {
        const message = await partnerServices.getResources(data, req.headers.authorization)
        return res.status(200).json(message)
    } catch (err) {
        // Error caused by client
        if (err.code === -1) {
            return res.status(401).json(err)
        }
        return res.status(500).json(err)
    }
}



module.exports = {
    name: 'partnerController',
    partnerLogin,
    createPartner,
    refreshToken,
    getPartnersByQuery,
    getResources
}