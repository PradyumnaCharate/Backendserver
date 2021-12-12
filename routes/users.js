var express = require('express');
var bodyParser=require("body-parser");
var router = express.Router();
var User=require("../models/user");
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


//this is for /user/signup 
router.post("/signup",(req,res,next)=>{
  //We will check for if this new useername already exists or not on the server database.if yes you are entering duplicate.
  //not alloweed
  User.findOne({username:req.body.username})
  .then((user)=>{
    if (user !=null){
      var err=new Error("User "+req.body.username+" already exists");
      err.status=403;
      next(err);
    }
    else{
      return User.create({
        username:req.body.username,
        password:req.body.password 
        //this will let user signup
      });
    }

  })
  //^| this will return a user as a promise when creeated new one
  .then((user)=>{
    res.statusCode=200;
    res.setHeader('Content-Type', 'application/json');
    res.json({status: 'Registration Successful!', user: user});
  },(err)=>next(err))
  .catch((err)=>next(err));

});

router.post("/login",(req,res,next)=>{
  if(!req.session.user){
    var authHeader=req.headers.authorization;
    if (!authHeader){
      //If no authorization info is found
      var err=new Error("You are not authorized");
      res.setHeader("WWW-Authenticate","Basic");
      err.status=401;
      return next(err);
    }
    //If authHeader is not empty then it contains Basic username:password so we will cut this string into two parts 
    //Basic and another part will be user and pass.Buffer helps us in splitting and in return we will get array...
    //0th element is basic and 1st element is encoding then we will again split the encoding into user and pass
    //split by : because iut seperated them
    var auth=new Buffer.from(authHeader.split(" ")[1],"base64").toString().split(":")
    var username=auth[0];
    var password=auth[1];
    User.findOne({username:username})
    .then((user)=>{
      if(user===null){
        var err=new Error("User "+username+" does not exist");
        err.status=403;
        return next(err);
      }
      else if (user.password!=password){
        var err=new Error("Your Password is not correct!");
        err.status=403;
        return next(err);

      }//double checking that username and password are same
      else if (user.username===username && user.password===password){
        //So if matches then it goes to next middleware
        //this will set cookie on client side after succesfull authentication
        req.session.user="authenticated";
        res.statusCode=200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You are authenticated!')
      }
    }) 
    .catch((err) => next(err));
    

  }
  //*If already loggin or session cookie found in header then 
  else{
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already authenticated!');
  }
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
