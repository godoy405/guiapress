const Sequelize = require('sequelize');
const connection = require('../database/database');
const Category = require('../categories/Category');

const Article = connection.define('articles', {
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },slug: {
        type: Sequelize.STRING,
        allowNull: false
    },body: {
        type: Sequelize.TEXT,
        allowNull: false
    }
});

Category.hasMany(Article, { foreignKey: "categoryId", as: "articles" });
Article.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

Article.sync({ force: false }).then(() => {
    console.log("Tabela de artigos criada com sucesso.");
}).catch((error) => {
    console.error("Erro ao criar a tabela de artigos:", error);
});

module.exports = Article;