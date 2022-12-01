import express from "express";
import {
    homeController,
    apiDocsController,
    partnerController,
    modelController,
    warehouseController,
    productController,
    customerController,
    exportController,
    maintainController
} from '../controllers/index'


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
    router.post('/api/get-warehouses-by-query', warehouseController.getWarehousesByQuery)

    // Products
    router.post('/api/create-products', productController.createProducts)
    router.post('/api/get-products-by-ids', productController.getProductsByIds)
    router.post('/api/get-products-by-query', productController.getProductsByQuery)

    // Customers
    router.post('/api/get-customers-by-query', customerController.getCustomersByQuery)

    // Exports
    router.post('/api/get-exports-by-query', exportController.getExportsByQuery)

    // Maintains
    router.post('/api/get-maintains-by-query', maintainController.getMaintainsByQuery)

    router.get('/', homeController.getHomePage)
    router.get('/api/docs', apiDocsController.getAPIDocs)
    router.get('/send-email', homeController.sendMail)

    return app.use("/", router)

}

module.exports = initWebRouters;