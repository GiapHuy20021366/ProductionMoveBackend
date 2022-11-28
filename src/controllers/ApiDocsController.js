import { readApiDocs } from '../services/ApiDocsServices'

let getAPIDocs = (req, res) => {
    const apiDocs = readApiDocs()
    return res.render('api-docs.ejs', { data: apiDocs })
}


module.exports = {
    getAPIDocs
}