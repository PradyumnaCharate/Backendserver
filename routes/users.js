var express = require('express');
var bodyParser=require("body-parser");
var router = express.Router();
var User=require("../models/user");
var passport=require("passport");
var authenticate=require("../authenticate");
router.use(bodyParser.json());
const cors=require("./cors")


/* GET users listing. */

router.get('/',cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, function(req, res, next) {
  User.find({})
  .then((users) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(users);
}, (err) => next(err))
.catch((err) => next(err));

});


//this is for /user/signup 
router.post("/signup",cors.corsWithOptions,(req,res,next)=>{
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
    if (req.body.firstname)
      user.firstname = req.body.firstname;
    if (req.body.lastname)
      user.lastname = req.body.lastname;
    user.save((err,user)=>{
      if(err){
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({err: err});
        return;
      }
      passport.authenticate('local')(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Registration Successful!'});

    });

    });
  }
});

});
router.get("/facebook/token",passport.authenticate("facebook-token"),(req,res)=>{//if facebook token is authenticated
  //then req will contain req.user
  if(req.user){
    var token=authenticate.getToken({_id:req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, status: 'You are succesfully logged in',token:token});

  }

})
//passport expects user and pass to be in requests body and not in authorization header unlike we were doing it previously

//when post request comes with username and pass password.authenticate ("local") will be called and if succesfull login then
//it goes to next(req,res) otherwise it will send the error to client on its own.


//Earlier We were creating sessions when user loggid in succesfully so instead of this we will now create 
//and assign token using get token method we implemented by assigning user is to it as paramater and pass back to user
router.post("/login",cors.corsWithOptions,passport.authenticate('local'),(req,res)=>{
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
