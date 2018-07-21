var express = require("express"),
    passport = require("passport"),
    User = require("../models/user"),
    router = express.Router();

router.get("/", function(req, res) {
    res.render("landing");
});

router.get("/register", function(req, res) {
    res.render("register");
})

router.post("/register", function(req, res) {
    User.register(new User({username: req.body.username}), req.body.password, function(err, user) {
        if(err) {
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function() {
            req.flash("success", "Successfully registered!");
            res.redirect("/food");
        })
    });
})

router.get("/login", function(req, res) {
    res.render("login");
})

router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/food",
        failureRedirect: "/login"
    }), function(req, res) {}
);

router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "You have logged out!");
    res.redirect("/food");
})

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please log in first!");
    res.redirect("/login");
}

module.exports = router;