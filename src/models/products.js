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
            Products.belongsTo(models.Models, { foreignKey: 'id' })
            // Products.belongsTo(models.)
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