'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Maintains extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Maintains.belongsTo(models.Products, { foreignKey: 'productId', targetKey: 'id', as: 'product' })
        }
    };
    Maintains.init({
        productId: DataTypes.INTEGER,
        date: DataTypes.DATE,
        note: DataTypes.TEXT
    }, {
        sequelize,
        modelName: 'Maintains',
    });
    return Maintains;
};