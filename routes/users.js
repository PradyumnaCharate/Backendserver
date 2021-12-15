var express = require('express');
var bodyParser=require("body-parser");
var router = express.Router();
var User=require("../models/user");
var passport=require("passport");
var authenticate=require("../authenticate");
router.use(bodyParser.json());



/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


//this is for /user/signup 
router.post("/signup",(req,res,next)=>{
 //mongoose plugin we used provide some methods to signup(register)=>which takes username and password from request as parameters and return to callback function error and new user
// passport expects yoy to do it this way
  User.register(new User({username: req.body.username}), 
  req.body.password, (err, user) => {
  if(err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.json({err: err});
  }
  else {
    passport.authenticate('local')(req, res, () => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true, status: 'Registration Successful!'});
    });
  }
});

});

//passport expects user and pass to be in requests body and not in authorization header unlike we were doing it previously

//when post request comes with username and pass password.authenticate ("local") will be called and if succesfull login then
//it goes to next(req,res) otherwise it will send the error to client on its own.


//Earlier We were creating sessions when user loggid in succesfully so instead of this we will now create 
//and assign token using get token method we implemented by assigning user is to it as paramater and pass back to user
router.post("/login",passport.authenticate('local'),(req,res)=>{
  var token=authenticate.getToken({_id:req.user._id})
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, status: 'You are succesfully logged in',token:token});
});


router.get("/logout",(req,res,next)=>{
  //so if session of the user exists then you can logout
  if(req.session){
    //when logged out then session will be destroyed and client wiull have to login again
    req.session.destroy();
    //session id is name our session in app.js this will ask user to clear cookie on their side
    res.clearCookie("session-id");
    res.redirect("/")
     
  }
  //If session does not exist then there is no point logging out 
  else {
    var err=new Error("You are not logged in!");
    err.status=403;
    return next(err);

  }

});

module.exports = router;
