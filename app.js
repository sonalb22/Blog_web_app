//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const passport = require("passport");
const User  = require("./models/user");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");



mongoose.connect("mongodb+srv://sonal:sonal522@cluster0.b72pi.mongodb.net/blogDB",{userNewUrlParser:true});

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const blogSchema =new mongoose.Schema({
title:String,
body:String
});

var Blog = mongoose.model("Blog",blogSchema);

app.use(require("express-session")({
  secret:"rusty is the best",//could be any english text ....used to encode and decode sessions
  resave:false,
  saveUninitialized:false
  }));

 //setting passport up to use in our application 
app.use(passport.initialize());
 app.use(passport.session());


 
passport.use(new LocalStrategy(User.authenticate()));

//used for reading the sessions , talinh data from sessions , decode it and then again encode it and put back to sessions
 passport.serializeUser(User.serializeUser());
 passport.deserializeUser(User.deserializeUser());


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
     body:req.body.postBody
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
