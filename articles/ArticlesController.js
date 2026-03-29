const express = require('express');
const router = express.Router();
const Category = require('../categories/Category');
const Article = require("./Article");
const slugify = require("slugify");

function extractTextFromHtml(html) {
    return html
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&[^;\s]+;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

router.get("/admin/articles", (req, res) => {
    Article.findAll({
        order: [["id", "DESC"]],
        include: [{ model: Category, as: "category" }]
    }).then(articles => {
        res.render("admin/articles/index", { articles: articles });
    }).catch(error => {
        console.error("Erro ao listar artigos:", error);
        res.render("admin/articles/index", { articles: [] });
    });
});

router.get("/admin/articles/new", (req, res) => {
    Category.findAll().then(categories => {
        res.render("admin/articles/new", { categories: categories });
    }).catch(error => {
        console.error("Erro ao carregar categorias:", error);
        res.render("admin/articles/new", { categories: [] });
    });
});

router.post("/articles/save", (req, res) => {
    let title = (req.body.title || "").trim();
    const body = (req.body.body || "").trim();
    const categoryId = req.body.category ? parseInt(req.body.category, 10) : NaN;

    if (!body || !Number.isInteger(categoryId) || categoryId < 1) {
        return res.redirect("/admin/articles/new");
    }

    // Gera título automaticamente quando vier vazio no formulário.
    if (!title) {
        const plainText = extractTextFromHtml(body);
        title = plainText ? plainText.substring(0, 80) : "Artigo sem titulo";
    }

    let slug = slugify(title, { lower: true, strict: true });
    if (!slug) {
        slug = `artigo-${Date.now()}`;
    }

    Article.create({
        title: title,
        slug: slug,
        body: body,
        categoryId: categoryId
    }).then(() => {
        res.redirect("/admin/articles");
    }).catch(error => {
        console.error("Erro ao salvar artigo:", error);
        res.redirect("/admin/articles/new");
    });
});

router.post("/articles/delete", (req, res) => {
    var id = req.body.id;
    if (id != undefined) {
        if (!isNaN(id)) {
            Article.destroy({
                where: {
                    id: id
                }
            }).then(() => {
                res.redirect("/admin/articles");
            }); 
        } else {// não for um número
            res.redirect("/admin/articles");
        }
    } else {// null
        res.redirect("/admin/articles");
    }
});

module.exports = router;