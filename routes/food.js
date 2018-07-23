var express = require("express"),
    router = express.Router(),
    Food = require("../models/food");

router.get("/", function(req, res) {
    Food.find({}, function(err, allFood) {
        if(err) {
            console.log(err);
        } else {
        res.render("index", {dish: allFood});
        };
    });
});

router.post("/", isLoggedIn, function(req, res) {
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newFood = {name: name, image: image, description: description, author: author};
    Food.create(newFood, function(err, newlyCreated) {
        if(err) {
            console.log("err");
        } else {
            req.flash("success", "You have added a new dish!");
            res.redirect("/food");
        }
    })
});

router.get("/new", isLoggedIn, function(req, res) {
    res.render("new");
});

router.get("/:id", function(req, res) {
    Food.findById(req.params.id).populate("comments addresses").exec(function(err, createdFood) {
        if(err) {
            console.log(err);
        } else {
            res.render("foodinfo", {dish: createdFood});
        }
    });
});

router.get("/:id/edit", checkUser, function(req, res) {
    Food.findById(req.params.id, function(err, foundFood) {
            res.render("edit", {dish: foundFood});
    });
})

router.put("/:id", checkUser, function(req, res) {
    Food.findByIdAndUpdate(req.params.id, req.body.site, function(err, updatedFood) {
        if(err) {
            res.redirect("back");
        } else {
            req.flash("success", "Successfully edited!");
            res.redirect("/food/" + req.params.id);
        }
    });
})

router.delete("/:id", checkUser, function(req, res) {
    Food.findByIdAndRemove(req.params.id, function(err) {
        if(err) {
            res.redirect("/food");
        } else {
            req.flash("success", "Successfully deleted!");
            res.redirect("/food");
        }
    });
})

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please log in first!");
    res.redirect("/login");
}

function checkUser(req, res, next) {
    if(req.isAuthenticated()) {
        Food.findById(req.params.id, function(err, foundFood) {
            if(err) {
                res.redirect("back");
            } else {
                if(foundFood.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You do not have permission to do that!");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "Please log in first!");
        res.redirect("back");
    }
}

module.exports = router;