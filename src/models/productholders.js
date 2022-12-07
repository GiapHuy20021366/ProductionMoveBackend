'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ProductHolders extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            ProductHolders.belongsTo(models.Customers, { foreignKey: 'customerId', targetKey: 'id', as: 'customer' })
            ProductHolders.belongsTo(models.Partners, { foreignKey: 'partner1Id', targetKey: 'id', as: 'nowAt' })
            ProductHolders.belongsTo(models.Partners, { foreignKey: 'partner2Id', targetKey: 'id', as: 'willAt' })
            ProductHolders.belongsTo(models.Products, { foreignKey: 'productId', targetKey: 'id', as: 'product' })
        }
    };
    ProductHolders.init({
        productId: DataTypes.INTEGER,
        partner1Id: DataTypes.INTEGER,
        partner2Id: DataTypes.INTEGER,
        customerId: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'ProductHolders',
    });
    return ProductHolders;
};