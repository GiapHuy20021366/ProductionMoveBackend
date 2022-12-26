const fs = require('fs')
const path = require('path')
const basename = path.basename(__filename);

const services = {}

fs
    .readdirSync(path.resolve(__dirname))
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        const service = require(path.join(__dirname, file));
        services[service.name] = service
        // console.log(service.name)
    });

module.exports = services;