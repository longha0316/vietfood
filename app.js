var express = require("express"),
    app = express(),
    request = require("request"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    User = require("./models/user"),
    mongoose = require("mongoose"),
    flash = require("connect-flash"),
    Comment = require("./models/comment"),
    Food = require("./models/food"),
    Address = require("./models/address");

var commentRoutes = require("./routes/comments"),
    addressRoutes = require("./routes/addresses"),
    foodRoutes = require("./routes/food"),
    indexRoutes = require("./routes/index");
    
// mongoose.connect("mongodb://localhost/vietfood");
mongoose.connect("mongodb://longha:hello123@ds147391.mlab.com:47391/vietfood");

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(flash());

app.use(require("express-session")({
    secret: "Hello",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
})

app.use("/food/:id/comments", commentRoutes);
app.use("/food/:id/addresses", addressRoutes);
app.use("/food", foodRoutes);
app.use(indexRoutes);

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("App has started!");
});