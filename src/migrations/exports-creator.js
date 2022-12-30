'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Exports', {
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
            partnerSenderId: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            partnerRecieverId: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            date: {
                type: Sequelize.DATE
            },
            type: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            confirm: {
                default: false,
                type: Sequelize.BOOLEAN
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
            queryInterface.addIndex('Exports', ['productId', 'partnerSenderId', 'partnerRecieverId', 'type'])
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Exports');
    }
};