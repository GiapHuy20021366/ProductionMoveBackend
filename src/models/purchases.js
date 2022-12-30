'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Purchases extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Purchases.belongsTo(models.Customers, { foreignKey: 'customerId', targetKey: 'id', as: 'customer' })
            Purchases.belongsTo(models.Products, { foreignKey: 'productId', targetKey: 'id', as: 'product' })
            Purchases.belongsTo(models.Partners, { foreignKey: 'partnerId', targetKey: 'id', as: 'dealer' })
        }
    };
    Purchases.init({
        customerId: DataTypes.INTEGER,
        productId: DataTypes.INTEGER,
        date: DataTypes.DATE,
        partnerId: DataTypes.INTEGER,
        note: DataTypes.TEXT
    }, {
        sequelize,
        modelName: 'Purchases',
    });
    return Purchases;
};