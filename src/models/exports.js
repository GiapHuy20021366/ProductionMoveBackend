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
        }
    };
    Exports.init({
        productId: DataTypes.INTEGER,
        partnerSenderId: DataTypes.INTEGER,
        partnerRecieverId: DataTypes.INTEGER,
        date: DataTypes.DATE,
        type: DataTypes.INTEGER,
        confirm: DataTypes.BOOLEAN,
        note: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Exports',
    });
    return Exports;
};