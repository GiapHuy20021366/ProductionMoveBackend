import { Op } from 'sequelize'
import { messageCreater } from './untilsServices'
/**
 * 
 * @param {Object} query 
 * @param {Object} model 
 * @param {Array} exceptAttributes
 * @type {import('./untilsServices').Message}
 */
function parseQuery(query, model, exceptAttributes = []) {
    const modelAttributes = Object.keys(model.rawAttributes)
    const validAttributes = []
    for (let attribute of modelAttributes) {
        if (!exceptAttributes.includes(attribute)) {
            validAttributes.push(attribute)
        }
    }
    // console.log(validAttributes)

    const where = {}

    const getMessageInvalidAttribute = (op, location = '') => {
        for (let element of op) {
            const attribute = Object.keys(element)[0]
            if (!validAttributes.includes(attribute)) {
                return messageCreater(-1, 'error', `No attribute name ${attribute} at ${location} ... ${JSON.stringify(element)}`)
            }
        }
        return false
    }

    if (query.operations) {
        const operations = query.operations
        for (let op of Object.keys(operations)) {
            const messageInvalid = getMessageInvalidAttribute(operations[op], `operations.${op}`)
            if (messageInvalid) throw messageInvalid
            switch (op) {
                case 'and':
                    where[Op.and] = operations[op]
                    break
                case 'or':
                    where[Op.or] = operations[op]
                    break
                default:
                    throw messageCreater(-2, 'error', `Invalid operator ${op} at operations`)
            }
        }
    }
    // console.log(where)

    if (query.attributes) {
        const attributes = query.attributes
        // console.log(attributes)
        for (let attribute of Object.keys(attributes)) {
            if (!validAttributes.includes(attribute)) {
                throw messageCreater(-1, 'error', `Invalid attribute ${attribute} found at attributes`)
            }
            where[attribute] = {}
            const w_attribute = where[attribute]
            const attribute_obj = attributes[attribute]

            for (let op of Object.keys(attribute_obj)) {
                switch (op) {
                    case 'eq':
                        w_attribute[Op.eq] = attribute_obj[op]
                        break
                    case 'ne':
                        w_attribute[Op.ne] = attribute_obj[op]
                        break
                    case 'is':
                        w_attribute[Op.is] = attribute_obj[op]
                        break
                    case 'not':
                        w_attribute[Op.not] = attribute_obj[op]
                        break
                    case 'or':
                        w_attribute[Op.or] = attribute_obj[op]
                        break
                    case 'gt':
                        w_attribute[Op.gt] = attribute_obj[op]
                        break
                    case 'gte':
                        w_attribute[Op.gte] = attribute_obj[op]
                        break
                    case 'lt':
                        w_attribute[Op.lt] = attribute_obj[op]
                        break
                    case 'lte':
                        w_attribute[Op.lte] = attribute_obj[op]
                        break
                    case 'between':
                        w_attribute[Op.between] = attribute_obj[op]
                        break
                    case 'notBetween':
                        w_attribute[Op.notBetween] = attribute_obj[op]
                        break
                    case 'in':
                        w_attribute[Op.in] = attribute_obj[op]
                        break
                    case 'notIn':
                        w_attribute[Op.notIn] = attribute_obj[op]
                        break
                    case 'like':
                        w_attribute[Op.like] = attribute_obj[op]
                        break
                    case 'notLike':
                        w_attribute[Op.notLike] = attribute_obj[op]
                        break
                    case 'startsWith':
                        w_attribute[Op.startsWith] = attribute_obj[op]
                        break
                    case 'substring':
                        w_attribute[Op.substring] = attribute_obj[op]
                        break
                    case 'regexp':
                        w_attribute[Op.regexp] = attribute_obj[op]
                        break
                    case 'notRegexp':
                        w_attribute[Op.notRegexp] = attribute_obj[op]
                        break
                    default:
                        throw messageCreater(-2, 'error', `No operator name ${op} at attributes.${attribute} found`)
                }
            }
        }

    }

    return where
}

module.exports = {
    name: 'queryServices',
    parseQuery
}