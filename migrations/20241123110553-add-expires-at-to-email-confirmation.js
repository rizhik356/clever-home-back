'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('email_confirmation', 'expires_at', {
      type: Sequelize.DATE, // или Sequelize.DATEONLY, если вам не нужно время
      allowNull: true, // или false, если колонка обязательная
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('email_confirmation', 'expires_at');
  },
};
