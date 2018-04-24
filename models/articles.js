const Sequelize = require('sequelize');
const sequelize = new Sequelize(
  /*database=*/'Dian_officialsite',
  /*username=*/'dian-super-user',
  /*password=*/'wishDianlongliveandprosper',
  {
    host:       'localhost',
    dialect:    'mysql',
    operatorsAliases: false,    // use native commands
    define: {
      timestamps: false         // no `createAt` and `updatedAt` columns
    }
  });

// Define model
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('articles',
    {     // columns
      ID: {
        type:Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },

      title: {
        type: Sequelize.STRING(282),
        allowNull: false
      },

      publish_time: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },

      content: {
        type: Sequelize.TEXT
      }
    });
}


