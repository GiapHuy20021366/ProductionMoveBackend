'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Puchases extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Puchases.belongsTo(models.Customers, { foreignKey: 'customerId', targetKey: 'id', as: 'customer' })
            Puchases.belongsTo(models.Products, { foreignKey: 'productId', targetKey: 'id', as: 'product' })
            Puchases.belongsTo(models.Partners, { foreignKey: 'partnerId', targetKey: 'id', as: 'dealer' })
        }
    };
    Puchases.init({
        customerId: DataTypes.INTEGER,
        productId: DataTypes.INTEGER,
        date: DataTypes.DATE,
        partnerId: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'Puchases',
    });
    return Puchases;
};