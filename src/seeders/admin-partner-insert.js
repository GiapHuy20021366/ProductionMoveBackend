'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Partners', [{
      name: 'Bigcorp Admin',
      userName: 'bigcorp',
      password: '$2b$10$H2vGtvdMvmh/AhoZF3LApe94lloZs1RkZN/cQEY/k1mFFDPZUTDtC',
      email: 'huygiapboy@gmail.com',
      phone: '0384850710',
      address: 'Vietnam',
      birth: new Date(),
      status: 2,
      role: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Partners', null, {});
  }
};
