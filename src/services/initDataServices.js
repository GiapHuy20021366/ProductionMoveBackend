
import db from '../models/index'
import bcryptServices from '../services/bcryptServices'
// const csv = require('node-csv').createParser();
const csv = require('csv-parser')
const path = require('path')
const fs = require('fs')


const initPartners = (req, res) => {
    const results = [];
    fs.createReadStream(path.resolve(__filename, '../../public/data-init-samples/partners.csv'))
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            for (let partner of results) {
                const hashPass = await bcryptServices.hash(partner.password)
                partner.password = hashPass.data

                if (partner.birth === '') {
                    partner.birth = null
                }
            }
            try {
                await db.Partners.bulkCreate(results)
                return res.status(200).json({ result: 'SUCCESS' })
            } catch (error) {
                return res.status(500).json({ result: 'DATABASE_ERROR' })
            }
        });

    // return res.status(200).json({})
}

const initWarehouses = (req, res) => {
    const results = [];
    fs.createReadStream(path.resolve(__filename, '../../public/data-init-samples/warehouses.csv'))
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            const partners = await db.Partners.findAll({
                raw: true
            })
            // console.log(partners)
            const mapNameToPartner = {}
            for (let partner of partners) {
                mapNameToPartner[partner.name] = partner
            }
            for (let warehouse of results) {
                warehouse.partnerId = mapNameToPartner[warehouse.dealerName].id
            }

            try {
                await db.Warehouses.bulkCreate(results)
                return res.status(200).json({ result: 'SUCCESS' })
            } catch (error) {
                return res.status(500).json({ result: 'DATABASE_ERROR' })
            }
        });

}

const initModels = (req, res) => {
    const results = [];
    fs.createReadStream(path.resolve(__filename, '../../public/data-init-samples/models.csv'))
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            const partners = await db.Partners.findAll({
                raw: true
            })
            // console.log(partners)
            const mapNameToPartner = {}
            for (let partner of partners) {
                mapNameToPartner[partner.name] = partner
            }
            const fillter = []
            for (let model of results) {
                // valid birth
                model.birth = new Date(+model.birth, 0)
                model.numberOfSeats = +model.numberOfSeats
                model.length = +model.length
                model.width = +model.width
                model.height = +model.height
                model.maxSpeed = parseFloat(model.maxSpeed)
                model.accceleration = parseFloat(model.acceleration)
                model.cityFuel = parseFloat(model.cityFuel)

                const partner = mapNameToPartner[model.make]
                if (partner) {
                    model.factoryId = partner.id
                    fillter.push(model)
                } else {
                    // console.log("Miss ", model.make)
                }
            }

            for (let model of fillter) {
                for (let key of Object.keys(model)) {
                    if (!model[key]) {
                        model[key] = null
                    }
                }
            }

            try {
                await db.Models.bulkCreate(fillter)
                return res.status(200).json({ result: 'SUCCESS' })
            } catch (error) {
                return res.status(500).json({ result: 'DATABASE_ERROR' })
            }
        });


}

module.exports = {
    name: 'initDataServices',
    initPartners,
    initWarehouses,
    initModels
}