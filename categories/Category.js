const Sequelize = require('sequelize');
const connection = require('../database/database');

const Category = connection.define('categories', {
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },slug: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

Category.sync({ force: false }).then(() => {    
    console.log("Tabela de categorias criada com sucesso.");
}).catch((error) => {
    console.error("Erro ao criar a tabela de categorias:", error);
});

module.exports = Category;