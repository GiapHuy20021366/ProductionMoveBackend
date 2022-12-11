'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Messages extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Messages.belongsTo(models.Partners, { foreignKey: 'partnerId', targetKey: 'id', as: 'partner' })
        }
    };
    Messages.init({
        partnerId: DataTypes.INTEGER,
        date: DataTypes.DATE,
        content: DataTypes.TEXT
    }, {
        sequelize,
        modelName: 'Messages',
    });
    return Messages;
};