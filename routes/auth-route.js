const router = require("express").Router();
const passport = require("passport");
const User = require("../models/user-model");
const bcrypt = require("bcrypt");

router.get("/login", (req, res) => {
    res.render("login", { user: req.user });
});

router.get("/signup", (req, res) => {
    res.render("signup", {user: req.user});
});

router.post("/login", passport.authenticate("local", {
    failureRedirect: "/auth/login",
    failureFlash: "Email/password錯誤",
    }),
    (req, res) => {
        res.redirect("/profile");
});

router.post("/signup", async (req, res) => {
    let {name, email, password} = req.body;
    // check if the data in db
    const emailExist = await User.findOne({email});
    if (emailExist) {
        req.flash("error_msg", "Email已被註冊");
        res.redirect("/auth/signup");
    }
    const hash = await bcrypt.hash(password, 10);
    password = hash;
    let newUser = new User({ name, email, password});
    try {
        await newUser.save();
        req.flash("success_msg", "註冊成功");
        res.redirect("/auth/login");
    } catch (err) {
        req.flash("error_msg", err.errors.name.properties.message);
        res.redirect("/auth/signup");
    }
});

router.get("/logout", (req, res) => {
    req.logOut();
    res.redirect("/");
})

router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"],
}) 
);

router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
    res.redirect("/profile");
})

module.exports = router;