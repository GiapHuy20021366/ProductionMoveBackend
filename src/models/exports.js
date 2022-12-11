'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Exports extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Exports.belongsTo(models.Products, { foreignKey: 'productId', targetKey: 'id', as: 'product' })
            Exports.belongsTo(models.Partners, { foreignKey: 'partnerSenderId', targetKey: 'id', as: 'sender' })
            Exports.belongsTo(models.Partners, { foreignKey: 'partnerRecieverId', targetKey: 'id', as: 'reciever' })
        }
    };
    Exports.init({
        productId: DataTypes.INTEGER,
        partnerSenderId: DataTypes.INTEGER,
        partnerRecieverId: DataTypes.INTEGER,
        date: DataTypes.DATE,
        type: DataTypes.INTEGER,
        confirm: DataTypes.BOOLEAN,
        note: DataTypes.TEXT
    }, {
        sequelize,
        modelName: 'Exports',
    });
    return Exports;
};