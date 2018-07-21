var express = require("express"),
    router = express.Router({mergeParams: true}),
    Comment = require("../models/comment"),
    Food = require("../models/food");
    
router.get("/new", isLoggedIn, function(req, res) {
    Food.findById(req.params.id, function(err, createdFood) {
        if(err) {
            console.log(err);
        } else {
            res.render("newcmt", {dish: createdFood});
        }
    });
});

router.post("/", isLoggedIn, function(req, res) {
    Food.findById(req.params.id, function(err, createdFood) {
        if(err) {
            console.log(err);
            res.redirect("/food");
        } else {
            Comment.create(req.body.comment, function(err, comment) {
                if(err) {
                    console.log(err);
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    createdFood.comments.push(comment);
                    createdFood.save();
                    req.flash("success", "You have added a new comment!");
                    res.redirect("/food/" + createdFood._id);
                }
            })
        }
    });
});

router.get("/:comment_id/edit", checkCommentUser, function(req, res) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if(err) {
            console.log(err);
        } else {
            res.render("comedit", {dish_id: req.params.id, comment: foundComment});
        }
    })
})

router.put("/:comment_id", checkCommentUser, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment , function(err, updatedComment) {
        if(err) {
            res.redirect("back");
        } else {
            req.flash("success", "Successfully edited!");
            res.redirect("/food/" + req.params.id);
        }
    });
})

router.delete("/:comment_id", checkCommentUser, function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
        if(err) {
            res.redirect("back");
        } else {
            req.flash("success", "Successfully deleted!");
            res.redirect("/food/" + req.params.id);
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

function checkCommentUser(req, res, next) {
    if(req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err) {
                res.redirect("back");
            } else {
                if(foundComment.author.id.equals(req.user._id)) {
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