//mongod --dbpath=data --bind_ip 127.0.0.1
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


//express sessions
var session=require("express-session");
//to store session info into file store..it takes session object we created as paramaeter.
//this will save session info into session folder
var FileStore=require("session-file-store")(session) ;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishesRouter = require('./routes/dishRouter');
var promotionsRouter = require('./routes/promotionRouter');
var leadersRouter = require('./routes/leaderRouter');

//To establish coneection to mongodb server with mongoose
const mongoose=require("mongoose");
const Dishes =require("./models/dishes");
const url = 'mongodb://localhost:27017/conFusion';
const connect=mongoose.connect(url);
connect.then((db)=>{
  console.log("COnnected to the Database")
},(err)=>{console.log(err);});


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser("12345-67890-09876-54321"));
app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  //we will use FileStore object we created above
  store: new FileStore()
}));

function auth(req,res,next){
  //middleware parses and in req signed cookies
  console.log(req.session);
  //If cookie is not there then we search authentication info if not there ask,if wrong then deny if correct info 
  //then create and send signed cookie to him in response
  //.user because down below we are going to create cookie named user..
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
    if (username=="admin" && password =="password"){
      //So if matches then it goes to next middleware
      //this will set cookie on client side after succesfull authentication
      req.session.user="admin"
      next();
    }
    else{
      var err=new Error("Send Correct Authorization lawdya");
      res.setHeader("WWW-Authenticate","Basic");
      err.status=401;
      return next(err);

    }

  }
  else {
    if (req.session.user === 'admin') {
        next();
    }
    else{
      var err=new Error("Send Correct cookie lawdya");
      res.setHeader("WWW-Authenticate","Basic");
      err.status=401;
      return next(err);

    }
  }
  

}

//Authentication first
app.use(auth);
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/dishes",dishesRouter);
app.use("/leaders",leadersRouter);
app.use("/promotions",promotionsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
