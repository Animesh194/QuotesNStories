const express = require('express'),
	  bodyParser = require('body-parser'),
	  mongoose = require('mongoose'),
	  passport = require('passport'),
	  LocalStrategy = require('passport-local'),
	  flash = require('connect-flash'), 
	  User = require('./models/user');

const app = express();
var url = process.env.DATABASEURL || 'mongodb://localhost:27017/internship';

// mongoose.connect('mongodb://localhost:27017/internship',{useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect(url,{useNewUrlParser: true,useUnifiedTopology: true});

app.use(bodyParser.urlencoded({extended: true}));
app.use(flash());
app.set('view engine','ejs');

app.use(require("express-session")({
	secret: "A secret key",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({usernameField: 'email'},User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.get("/",function(req,res){
	res.render('index');
});

app.get("/home", isLoggedIn, function(req,res){
	res.render('home',{User: req.user});
});

app.get("/signup",function(req,res){
	res.render('new');
});

app.post("/signup",function(req,res){
	var greenaccess = true, redaccess;
	if(req.body.role === "Customer"){
		redaccess = false;
	}
	else{
		redaccess = true;
	}
	var newUser = new User({email:req.body.email, role: req.body.role, greenButtonAccess: greenaccess,redButtonAccess: redaccess});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			req.flash("error",err.message);
			res.redirect('/signup');
		}passport.authenticate("local")(req, res, function(){
			req.flash("success","Successfully signed up");
			res.redirect('/home');
		});
	})
});

app.get("/signin",function(req,res){
	res.render('signin');
});

app.post("/signin",passport.authenticate('local',{
	successRedirect: '/home',
	failureRedirect: '/signin'
}),function(req,res){});

app.get("/signout",function(req, res){
	req.logout();
	res.redirect('/');
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "You need to sign in first");
	res.redirect('/');
}

app.listen(process.env.PORT || 3000, process.env.IP, function(){
	// console.log('The server is running');
})
