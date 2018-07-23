var express = require("express"),
    router = express.Router({mergeParams: true}),
    Address = require("../models/address"),
    Food = require("../models/food");
    
router.get("/new", isLoggedIn, function(req, res) {
    Food.findById(req.params.id, function(err, createdFood) {
        if(err) {
            console.log(err);
        } else {
            res.render("newadd", {dish: createdFood});
        }
    });
});

router.post("/", isLoggedIn, function(req, res) {
    Food.findById(req.params.id, function(err, createdFood) {
        if(err) {
            console.log(err);
            res.redirect("/food");
        } else {
            Address.create(req.body.address, function(err, address) {
                if(err) {
                    console.log(err);
                } else {
                    address.author.id = req.user._id;
                    address.author.username = req.user.username;
                    address.save();
                    createdFood.addresses.push(address);
                    createdFood.save();
                    req.flash("success", "You have added a new address!");
                    res.redirect("/food/" + createdFood._id);
                }
            })
        }
    });
});

router.get("/:address_id/edit", checkAddressUser, function(req, res) {
    Address.findById(req.params.address_id, function(err, foundAddress) {
        if(err) {
            console.log(err);
        } else {
            res.render("addedit", {dish_id: req.params.id, address: foundAddress});
        }
    })
})

router.put("/:address_id", checkAddressUser, function(req, res) {
    Address.findByIdAndUpdate(req.params.address_id, req.body.address , function(err, updatedAddress) {
        if(err) {
            res.redirect("back");
        } else {
            req.flash("success", "Successfully edited!");
            res.redirect("/food/" + req.params.id);
        }
    });
})

router.delete("/:address_id", checkAddressUser, function(req, res) {
    Address.findByIdAndRemove(req.params.address_id, function(err) {
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

function checkAddressUser(req, res, next) {
    if(req.isAuthenticated()) {
        Address.findById(req.params.address_id, function(err, foundAddress) {
            if(err) {
                res.redirect("back");
            } else {
                if(foundAddress.author.id.equals(req.user._id)) {
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