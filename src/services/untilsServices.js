/**
 * @typedef {Object} Message
 * @property {number} code - A number represent code of message
 * @property {string} status - A string represent status of message
 * @property {string} message - A string represent message
 * @property {Object} data - An Object represent data of message 
 */
/**
 * @param {number} code
 * @param {string} status
 * @param {string} message
 * @param {Object} data
 * @type {Message}
 */
const messageCreater = (code = 0, status = 'nothing', message = '', data = {}) => {
    return {
        code, status, message, data
    }
}

module.exports = {
    name: 'untilsServies',
    messageCreater
}