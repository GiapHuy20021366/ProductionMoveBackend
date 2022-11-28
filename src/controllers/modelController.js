import modelServies from '../services/modelServices'
import { messageCreater } from '../services/untilsServices'

/**
 * 
 * @param {Oject} req - An Object represent request  
 * @param {Object} res - An Object represent response
 * @returns {Message} - Return a messsage 
 */
async function createNewModel(req, res) {
    // Check does token exists
    if (!req?.headers?.authorization) {
        return res.status(403).json(messageCreater(-4, 'error', 'Missing parameters: Token not found'))
    }

    const data = req.body
    if (!data || !data.name || !data.signName) {
        return res.status(400).json(messageCreater(-3, 'error', 'Missing parameters'))
    }

    try {
        const message = await modelServies.createModel(data, req.headers.authorization)
        return res.status(200).json(message)
    } catch (err) {
        // Error caused by client, model name existed
        if (err.code === -1) {
            return res.status(401).json(err)
        }
        return res.status(500).json(err)
    }
}

module.exports = {
    createNewModel
}