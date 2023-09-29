const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');
const sequelize = new Sequelize(config.db);

const Systems = sequelize.define('systems', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    content: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    tableName: 'systems', // Nama tabel yang sesuai
});

module.exports = Systems;
