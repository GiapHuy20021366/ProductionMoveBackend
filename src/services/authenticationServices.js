require('dotenv').config();
const jwt = require('jsonwebtoken');

/**
 * @param {object} data - An Object represent the data that need to be cover by generating a token.
 * @param {(number|string)} expriesIn - A number/string represent the duration of generating token. 
 * @type {string} - A string represent the token generated.
 * Generate a token cover data with secret key define in .env file.
 * The using algorithm is default by RS256.
 * Token generated will expries in 1h by default.
 */
function generateToken(data, expriesIn = '1h') {
    return jwt.sign({
        data: data
    }, process.env.PRIVATE_KEY, { expiresIn: expriesIn })
}

/**
 * @typedef {Object} VerifyTokenMessage 
 * @property {number} code - A number that represent code of message.
 * @property {string} status - A string that represent status of message.
 * @property {string} name - A string that represent name of error occurs.
 * @property {Object} data - An Object represent data decoded.
 */
/**
 * Verify a token 
 * @param {string} token - A string represent the token that need to verify.
 * @type {VerifyTokenMessage} - An Object represent the message returned after verify token.
 * Return a decode token if success else error message.
 * if token is successful verified, return an object with code=1, status='success' and data decoded from token.
 * If token is failture verified, return an object with code=-1, status='error' and name that show error occurs. 
 *  ~name='TokenExpiredError': The token is expired.
 *  ~name='JsonWebTokenError': Error object.
 *  ~name='NotBeforeError': Current time is before the nbf claim.
 */
async function verifyToken(token) {
    return new Promise(async (resolve, reject) => {
        const message = {}
        jwt.verify(token, process.env.PRIVATE_KEY, function (err, decoded) {
            // err
            if (err) {
                message.code = -1
                message.status = 'error'
                message.name = err.name
                message.data = {}
                reject(message)
            }
            // decoded 
            if (decoded) {
                message.code = 1
                message.status = 'success'
                message.name = ''
                message.data = decoded
                resolve(message)
            }
        });
    })
}


module.exports = {
    name: 'authenticationServices',
    generateToken,
    verifyToken,
}