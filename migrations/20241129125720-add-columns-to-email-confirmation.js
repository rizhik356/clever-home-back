'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('email_confirmation', 'is_used', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Установите значение по умолчанию, если это необходимо
    });
    await queryInterface.addColumn('email_confirmation', 'token', {
      type: Sequelize.STRING,
      allowNull: false, // Установите в true или false в зависимости от ваших требований
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('email_confirmation', 'is_used');
    await queryInterface.removeColumn('email_confirmation', 'token');
  },
};
