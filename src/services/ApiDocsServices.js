const fs = require('fs')
const path = require('path')
const DOCS_PATH = '../public/api-docs'

const readApiDocs = () => {
    const apiDocs = []
    fs
        .readdirSync(path.resolve(__dirname, DOCS_PATH))
        .filter(file => {
            return (file.indexOf('.') !== 0) && (file.slice(-5) === '.json')
        })
        .forEach(file => {
            let pathFile = path.resolve(__dirname, DOCS_PATH, file)
            const apiData = fs.readFileSync(pathFile, 'utf8')
            const api = JSON.parse(apiData)
            let lastModified = fs.statSync(pathFile).mtime
            api["LastModiied"] = Math.floor((new Date().getTime() - lastModified) / 1000)
            apiDocs.push(api)
        });
    return apiDocs;
}

module.exports = {
    name: 'apiDocsServices',
    readApiDocs
}