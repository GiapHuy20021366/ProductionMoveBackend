'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Warehouses extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Warehouses.belongsTo(models.Partners, { foreignKey: 'partnerId', targetKey: 'id', as: 'partner' })
        }
    };
    Warehouses.init({
        name: DataTypes.STRING,
        address: DataTypes.STRING,
        partnerId: DataTypes.INTEGER,
    }, {
        sequelize,
        modelName: 'Warehouses',
    });
    return Warehouses;
};