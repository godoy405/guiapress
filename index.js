const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require("express-session");
const connection = require('./database/database');

const categoriesController = require('./categories/CategoriesController');
const articlesController = require('./articles/ArticlesController');
const Sequelize = require('sequelize');
const usersController = require('./users/UsersController');

const Category = require('./categories/Category');
const Article = require('./articles/Article');
const User = require('./users/User');
app.use(express.json());

//view engine setup
app.set('view engine', 'ejs');

// Sessions

app.use(session({
  secret:"qualquercoisa", cookie: { maxAge: 600000000000000 }
}));

//Static folder
app.use(express.static('public'));


//Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Database connection
connection
  .authenticate()
  .then(() => {
    console.log('Database connected successfully.');
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
  });

//Routes  

app.use('/', categoriesController);
app.use('/', articlesController);
app.use('/', usersController);

app.get('/', (req, res) => {
    Article.findAll({
      order:[
        ["id", "DESC"]
      ],
      limit: 6
    }).then(articles => {
      Category.findAll().then(categories => {
        res.render('index', {articles: articles, categories: categories});
      });      
    });    
});

app.get("/articles/:slug", (req, res) => {
  const slug = (req.params.slug || "").trim().toLowerCase();
  Article.findOne({
    where: Sequelize.where(
      Sequelize.fn("LOWER", Sequelize.col("slug")),
      slug
    ),
    order: [["updatedAt", "DESC"], ["id", "DESC"]]
  }).then(article => {
    if (article != undefined) {
      Category.findAll().then(categories => {
        res.render("article", { article: article, categories: categories });
      });
    } else {
      res.redirect("/");
    }
  }).catch(() => {
    res.redirect("/");
  });
});

app.get("/category/:slug", (req, res) => {
  const slug = (req.params.slug || '').trim().toLowerCase();

  Category.findOne({
    where: Sequelize.where(
      Sequelize.fn('LOWER', Sequelize.col('slug')),
      slug
    ),
    include: [{ model: Article, as: 'articles' }]
  }).then(category => {
    if (category != undefined) {
      Category.findAll().then(categories => {
        res.render('index', { articles: category.articles, categories: categories });
      });
    } else {
      res.redirect('/');
    }
  }).catch(err => {
    res.redirect('/');
  });
});

app.listen(8080, () => {  console.log('Example app listening on port 8080!');
});