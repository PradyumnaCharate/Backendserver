//STore of authentication strategies
var passport=require("passport");
var LocalStrategy=require("passport-local") .Strategy;
var User=require("./models/user");


//passport extract  username and password from message body use and supply parameters to verify function we will supply to local strategy 
exports.local=passport.use(new LocalStrategy(User.authenticate()));//We can also write our own authentication function we implemented previously 
//but this User.authenticate is provided by mongoose passport itself.


//takes user info from request 
//These 2 functions are provided by passport local mongoose plugin on USER schema we used in user.js
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());