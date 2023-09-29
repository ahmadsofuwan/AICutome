const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');
const sequelize = new Sequelize(config.db);


const History = sequelize.define('historys', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    content: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    from: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    role: {
        type: DataTypes.ENUM('user', 'assistant'),
        allowNull: true,
    }
}, {
    tableName: 'historys', // Nama tabel yang sesuai
});

module.exports = History;
