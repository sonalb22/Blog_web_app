//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const passport = require("passport");
const User  = require("./models/user");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");

mongoose.connect("mongodb+srv://sonal:sonal522@cluster0.b72pi.mongodb.net/blogDB",{userNewUrlParser:true});

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const blogSchema =new mongoose.Schema({
title:String,
body:String,
author:String
});

var Blog = mongoose.model("Blog",blogSchema);


 //setting passport up to use in our application 
app.use(passport.initialize());
 app.use(passport.session());


 
passport.use(new LocalStrategy(User.authenticate()));

//used for reading the sessions , taking data from sessions , decode it and then again encode it and put back to sessions
passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });



 passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "https://fathomless-brushlands-31693.herokuapp.com/auth/google/blogs",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
//google providing acessToken to acess info of user
function(accessToken, refreshToken, profile, cb) {
  //either  find the user with thses info or create it
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));



app.get("/", function(req, res){
  Blog.find({},function(err,posts){
    res.render("home",{
     posts:posts
    });
    });
});



app.get("/about", function(req, res){
  res.render("about");
});

app.get("/contact", function(req, res){
  res.render("contact");
});


app.get("/register",function(req,res){
  res.render("register");
 });


 app.post("/register",function(req,res){
  req.body.username
  req.body.password
  User.register(new User({username:req.body.username}),req.body.password,function(err,user){
  if(err){
    console.log(err);
    return res.render('register');
  }
  passport.authenticate("local")(req,res,function(){
  res.redirect("/compose");
  });
  });
  });

app.get("/login",function(req,res){
  res.render("login");
 });

 app.post("/login",passport.authenticate("local",{
  successRedirect:"/compose",
  failureRedirect:"/login"
}),function(req,res){

});
 

app.get("/compose",isLoggedIn, function(req, res){
  res.render("compose");
});

app.post("/compose",function(req, res){
 const newBlog = new Blog({
     title:req.body.postTitle,
     body:req.body.postBody,
     author:req.body.Author
 });
     newBlog.save();
     res.redirect("/");
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
  return next();
  }
  res.redirect("/login");
}

//redirected to this route when hits sign in/up with google
//will authenticate the user
app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);
//after authentication , this route will be triggered which will redirect to the compose page
app.get("/auth/google/blogs",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect to compose.
    res.redirect("/compose");
  });

app.get("/posts/:postId", function(req, res){
  const requestedPostId = req.params.postId;

  Blog.findOne({_id: requestedPostId}, function(err,blog){

    res.render("post", {
 
      title: blog.title,
      content: blog.body
    });
  });

  });

//Log out route
app.get("/logout",function(req,res){
  req.logout();//will log the user out , passport will destroy the users data in session.
  res.redirect("/");
 });
 

app.listen(process.env.PORT||3000, function() {
  console.log("Server started on port 3000");
});
