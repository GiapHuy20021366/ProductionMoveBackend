'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Recalls extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Recalls.belongsTo(models.Products, { foreignKey: 'productId', targetKey: 'id', as: 'product' })
        }
    };
    Recalls.init({
        productId: DataTypes.INTEGER,
        date: DataTypes.DATE,
        note: DataTypes.TEXT
    }, {
        sequelize,
        modelName: 'Recalls',
    });
    return Recalls;
};