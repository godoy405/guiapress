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

router.get("/admin/articles/edit/:id", (req, res) => {
    const id = req.params.id;

    if (isNaN(id)) {
        return res.redirect("/admin/articles");
    }

    Article.findByPk(id).then(article => {
        if (article != undefined) {
            Category.findAll().then(categories => {
                res.render("admin/articles/edit", { article: article, categories: categories });
            });
        } else {
            res.redirect("/admin/articles");
        }
    }).catch(() => {
        res.redirect("/admin/articles");
    });
});

router.post("/articles/update", (req, res) => {
    const id = parseInt(req.body.id, 10);
    let title = (req.body.title || "").trim();
    const body = (req.body.body || "").trim();
    const categoryId = req.body.category ? parseInt(req.body.category, 10) : NaN;

    if (!Number.isInteger(id) || id < 1 || !body || !Number.isInteger(categoryId) || categoryId < 1) {
        return res.redirect("/admin/articles");
    }

    if (!title) {
        const plainText = extractTextFromHtml(body);
        title = plainText ? plainText.substring(0, 80) : "Artigo sem titulo";
    }

    Article.findByPk(id).then(existingArticle => {
        if (!existingArticle) {
            return res.redirect("/admin/articles");
        }

        // Mantém o slug estável após edição para não quebrar URLs já usadas.
        const slug = existingArticle.slug && existingArticle.slug.trim()
            ? existingArticle.slug
            : (slugify(title, { lower: true, strict: true }) || `artigo-${id}`);

        Article.update(
            {
                title: title,
                slug: slug,
                body: body,
                categoryId: categoryId
            },
            {
                where: { id: id }
            }
        ).then(() => {
            res.redirect("/admin/articles");
        }).catch(error => {
            console.error("Erro ao atualizar artigo:", error);
            res.redirect(`/admin/articles/edit/${id}`);
        });
    }).catch(error => {
        console.error("Erro ao buscar artigo para atualizar:", error);
        res.redirect(`/admin/articles/edit/${id}`);
    });
});

router.get("/articles/page/:num",(req,res) => {
    const page = parseInt(req.params.num, 10) || 1;
    const limit = 6;
    const offset = page <= 1 ? 0 : (page - 1) * limit;

    Article.findAndCountAll({
        limit: limit,
        offset: offset,
        order: [["id", "DESC"]]
    }).then(articles => {
        const next = (offset + limit) < articles.count;

        const result = {
            page: page,
            next: next,
            articles: articles
        };

        Category.findAll().then(categories => {
            res.render("admin/articles/page", { result: result, categories: categories });
        });
    }).catch(error => {
        console.error("Erro na paginação de artigos:", error);
        res.redirect("/");
    });
});

module.exports = router;