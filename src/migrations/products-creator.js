'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Products', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            modelId: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            birth: {
                type: Sequelize.DATE
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
            queryInterface.addIndex('Products', ['modelId'])
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Products');
    }
};