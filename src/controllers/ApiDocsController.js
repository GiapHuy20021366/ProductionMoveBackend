import { apiDocsServices } from '../services/index'

let getAPIDocs = (req, res) => {
    const apiDocs = apiDocsServices.readApiDocs()
    return res.render('api-docs.ejs', { data: apiDocs })
}


module.exports = {
    name: 'apiDocsController',
    getAPIDocs
}