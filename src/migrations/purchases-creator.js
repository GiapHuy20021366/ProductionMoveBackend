'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Purchases', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            customerId: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            productId: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            date: {
                type: Sequelize.DATE
            },
            partnerId: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            note: {
                type: Sequelize.TEXT
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
            queryInterface.addIndex('Purchases', ['customerId', 'productId', 'partnerId'])
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Purchases');
    }
};