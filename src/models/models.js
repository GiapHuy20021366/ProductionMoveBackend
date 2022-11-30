'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Models extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Models.belongsTo(models.Partners, { foreignKey: 'factoryId', targetKey: 'id', as: 'factory' })
            Models.hasMany(models.Products, { foreignKey: 'modelId', as: 'products' })
        }
    };
    Models.init({
        name: DataTypes.STRING,
        signName: DataTypes.STRING,
        factoryId: DataTypes.INTEGER,
        birth: DataTypes.DATE,
        generation: DataTypes.STRING,
        series: DataTypes.STRING,
        trim: DataTypes.STRING,
        bodyType: DataTypes.STRING,
        numberOfSeats: DataTypes.INTEGER,
        length: DataTypes.INTEGER,
        width: DataTypes.INTEGER,
        height: DataTypes.INTEGER,
        engineType: DataTypes.STRING,
        boostType: DataTypes.STRING,
        maxSpeed: DataTypes.FLOAT,
        accceleration: DataTypes.FLOAT,
        cityFuel: DataTypes.FLOAT
    }, {
        sequelize,
        modelName: 'Models',
    });
    return Models;
};