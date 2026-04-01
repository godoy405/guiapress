const Sequelize = require('sequelize');
const connection = require('../database/database');

const User = connection.define('users', {
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },password: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

User.sync({ force: false }).then(() => {    
    console.log("Usuário cadastrado com sucesso.");
}).catch((error) => {
    console.error("Erro ao criar um usuário:", error);
});

module.exports = User;