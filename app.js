//mongod --dbpath=data --bind_ip 127.0.0.1
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

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
app.use(cookieParser());

function auth(req,res,next){
  console.log(req.headers);
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
  var auth=new Buffer(authHeader.split(" ")[1],"base64").toString().split(":")
  var username=auth[0];
  var password=auth[1];
  if (username=="admin" && password =="password"){
    //So if matches then it goes to next middleware
    next();
  }
  else{
    var err=new Error("Send Correct Authorization lawdya");
    res.setHeader("WWW-Authenticate","Basic");
    err.status=401;
    return next(err);

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
