import express from "express";
import homeController from "../controllers/homeController"
import ApiDocsController from "../controllers/ApiDocsController"
import partnerController from '../controllers/partnerController'
import modelController from '../controllers/modelController'
import warehouseController from '../controllers/warehouseController'
import productController from '../controllers/productController'

import { initPartners, initWarehouses, initModels } from '../services/initDataServices'

let router = express.Router();



let initWebRouters = (app) => {

    // Partners
    router.post('/api/login-partner', partnerController.partnerLogin)
    router.post('/api/create-partner', partnerController.createPartner)
    router.post('/api/get-partners-by-query', partnerController.getPartnersByQuery)

    // Authentication
    router.get('/api/refresh-token', partnerController.refreshToken)

    // Models
    router.post('/api/create-model', modelController.createNewModel)
    router.post('/api/get-models-by-ids', modelController.getModelsInf)
    router.post('/api/get-models-by-query', modelController.getModelsByQuery)

    // Warehouses
    router.post('/api/create-warehouse', warehouseController.createNewWarehouse)

    // Products
    router.post('/api/create-products', productController.createProducts)
    router.post('/api/get-products-by-ids', productController.getProductsByIds)
    router.post('/api/get-products-by-query', productController.getProductsByQuery)

    router.get('/', homeController.getHomePage)
    router.get('/api/docs', ApiDocsController.getAPIDocs)
    router.get('/send-email', homeController.sendMail)

    return app.use("/", router)

}

module.exports = initWebRouters;