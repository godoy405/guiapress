const express = require("express");
const router = express.Router();
const User = require("./User");
const bcrypt = require("bcryptjs");
const Sequelize = require("sequelize");

router.get("/admin/users", (req, res) => {
    User.findAll().then(users => {
        res.render("admin/users/index", { users: users });
    });
});

router.get("/admin/users/create", (req, res) => {
    res.render("admin/users/create", {
        emailExists: req.query.error === "email_exists"
    });
});

router.post("/admin/users/create", (req, res) => {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = (req.body.password || "").trim();

    if (!email || !password) {
        return res.redirect("/admin/users/create");
    }

    User.findOne({
        where: Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("email")),
            email
        )
    }).then(user => {
        if (user) {
            return res.redirect("/admin/users/create?error=email_exists");
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        return User.create({
            email: email,
            password: hash
        }).then(() => {
            res.redirect("/admin/users");
        });
    }).catch((error) => {
        console.error("Erro ao criar usuário:", error);
        res.redirect("/admin/users/create");
    });
});

module.exports = router;