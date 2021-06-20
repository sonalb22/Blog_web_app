var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var UserSchema = new mongoose.Schema({
  username: String,
  password:String
});

//will add a bunch of methods that comes with passport local mongoose to our schema
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User",UserSchema);

