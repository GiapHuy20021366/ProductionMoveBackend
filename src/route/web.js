import express from "express";
import homeController from "../controllers/homeController"
import ApiDocsController from "../controllers/ApiDocsController"
import partnerController from '../controllers/partnerController'
import modelController from '../controllers/modelController'
import warehouseController from '../controllers/warehouseController'

import { initPartners, initWarehouses, initModels } from '../services/initDataServices'

let router = express.Router();



let initWebRouters = (app) => {

    router.post('/api/login-partner', partnerController.partnerLogin)
    router.get('/api/refresh-token', partnerController.refreshToken)
    router.post('/api/create-partner', partnerController.createPartner)
    router.post('/api/create-model', modelController.createNewModel)
    router.post('/api/create-warehouse', warehouseController.createNewWarehouse)

    router.get('/', homeController.getHomePage)
    router.get('/api/docs', ApiDocsController.getAPIDocs)
    router.get('/send-email', homeController.sendMail)

    return app.use("/", router)

}

module.exports = initWebRouters;