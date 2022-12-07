'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('ProductHolders', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            productId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            partner1Id: {
                allowNull: false,
                type: Sequelize.INTEGER,
                default: -1
            },
            partner2Id: {
                allowNull: false,
                type: Sequelize.INTEGER,
                default: -1
            },
            customerId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                default: -1
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        }).then(() => {
            queryInterface.addIndex('ProductHolders', ['productId', 'customerId', 'partner1Id', 'partner2Id'])
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('ProductHolders');
    }
};