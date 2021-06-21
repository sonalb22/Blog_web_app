var mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");
var passportLocalMongoose = require("passport-local-mongoose");
var UserSchema = new mongoose.Schema({
  username: String,
  password:String,
  googleId: String // to associate google id with the user to uniquely identify every user
  //otherwise the same user would be added to our database again and again evry time they register,but now using google id,
  //there won't be multiple entries for the same user
});

//will add a bunch of methods that comes with passport local mongoose to our schema
UserSchema.plugin(passportLocalMongoose);
UserSchema.plugin(findOrCreate);// add findorcreate as a plugin to mongoose
module.exports = mongoose.model("User",UserSchema);

