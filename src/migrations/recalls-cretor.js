'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Recalls', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            productId: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            date: {
                type: Sequelize.DATE
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
            queryInterface.addIndex('Recalls', ['productId'])
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Recalls');
    }
};