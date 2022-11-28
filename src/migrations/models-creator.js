'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Models', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                allowNull: false,
                type: Sequelize.STRING
            },
            signName: {
                allowNull: false,
                type: Sequelize.STRING
            },
            factoryId: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            birth: {
                type: Sequelize.DATE
            },
            generation: {
                type: Sequelize.STRING
            },
            series: {
                type: Sequelize.STRING
            },
            trim: {
                type: Sequelize.STRING
            },
            bodyType: {
                type: Sequelize.STRING
            },
            numberOfSeats: {
                type: Sequelize.INTEGER
            },
            length: {
                type: Sequelize.INTEGER
            },
            width: {
                type: Sequelize.INTEGER
            },
            height: {
                type: Sequelize.INTEGER
            },
            engineType: {
                type: Sequelize.STRING
            },
            boostType: {
                type: Sequelize.STRING
            },
            maxSpeed: {
                type: Sequelize.FLOAT
            },
            accceleration: {
                type: Sequelize.FLOAT
            },
            cityFuel: {
                type: Sequelize.FLOAT
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
            queryInterface.addIndex('Models', ['name', 'signName', 'factoryId'])
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Models');
    }
};