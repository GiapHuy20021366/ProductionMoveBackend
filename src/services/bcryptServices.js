import bcrypt from 'bcrypt'
import { messageCreater } from './untilsServices'
const saltRounds = 10

/**
 * 
 * @param {string} str - The string represent the text need to be hash
 * @type {Object} - Return a Object represent message that show result of hash process 
 */
async function hash(str) {
    return new Promise(async (resolve, reject) => {
        const message = {}
        bcrypt.hash(str, saltRounds, (err, hash) => {
            // success
            if (hash) {
                message.code = 1
                message.status = 'success'
                message.data = hash
                resolve(message)
            }
            // error
            if (err) {
                message.code = -1
                message.status = 'error'
                reject(message)
            }
            return message
        })
    })

}

/**
 * 
 * @param {string} plainText - A string represent the text that need to compare
 * @param {string} hash - A string that represent the hash that need to compare
 * @type {Object} -  Return a Object represent message that show result of compare process 
 */
async function compare(plainText, hash) {
    return new Promise(async (resolve, reject) => {
        bcrypt.compare(plainText, hash, function (err, result) {
            // error
            if (err) {
                reject(messageCreater(
                    -2,
                    'error',
                    'Failed to compare!',
                    false
                ))
            }

            // different
            if (!result) {
                reject(messageCreater(
                    -2,
                    'error',
                    'Different!',
                    false
                ))
            }

            // success
            if (result) {
                resolve(messageCreater(
                    1,
                    'success',
                    'Same!',
                    true
                ))
            }
        })
    })
}


module.exports = {
    name: 'bcryptServices',
    hash,
    compare
}