'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Partners extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Partners.hasMany(models.Models, { foreignKey: 'factoryId', as: 'models' })
      Partners.hasMany(models.Purchases, { foreignKey: 'partnerId', as: 'purchases' })
      Partners.hasMany(models.Messages, { foreignKey: 'partnerId', as: 'messages' })
      Partners.hasMany(models.Warehouses, { foreignKey: 'partnerId', as: 'warehouses' })
    }
  };
  Partners.init({
    name: DataTypes.STRING,
    userName: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    address: DataTypes.STRING,
    birth: DataTypes.DATE,
    status: DataTypes.INTEGER,
    role: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Partners',
  });
  return Partners;
};