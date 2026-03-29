const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const connection = require('./database/database');

const categoriesController = require('./categories/CategoriesController');
const articlesController = require('./articles/ArticlesController');

const Category = require('./categories/Category');
const Article = require('./articles/Article');

app.use(express.json());

//view engine setup
app.set('view engine', 'ejs');

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

app.get('/', (req, res) => {
    Article.findAll({
      order:[
        ["id", "DESC"]
      ]
    }).then(articles => {
      Category.findAll().then(categories => {
        res.render('index', {articles: articles, categories: categories});
      });      
    });    
});

app.get("/articles/:slug",(req,res)=>{
  const slug = req.params.slug;
  Article.findOne
    ({where: {
      slug: slug}
    }).then(article => {
      if(article != undefined){
        Category.findAll().then(categories => {
          res.render('article', {article: article, categories: categories});
        }); 
      }else{
        res.redirect('/');
      }
    }).catch(err => {
      res.redirect('/');
    });
  })

app.listen(8080, () => {  console.log('Example app listening on port 8080!');
});