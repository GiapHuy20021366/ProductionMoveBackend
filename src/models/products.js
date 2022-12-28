'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Products extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Products.belongsTo(models.Models, { foreignKey: 'modelId', targetKey: 'id', as: 'model' })
            Products.hasOne(models.Purchases, { foreignKey: 'productId', as: 'purchase' })
            Products.hasMany(models.Recalls, { foreignKey: 'productId', as: 'recalls' })
            Products.hasMany(models.Maintains, { foreignKey: 'productId', as: 'maintains' })
            Products.hasMany(models.Exports, { foreignKey: 'productId', as: 'exports' })
            Products.hasOne(models.ProductHolders, { foreignKey: 'productId', as: 'holders' })
        }
    };
    Products.init({
        modelId: DataTypes.INTEGER,
        birth: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'Products',
    });
    return Products;
};