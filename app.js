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
var passport=require("passport");
var authenticate=require("./authenticate");
var config=require("./config");
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishesRouter = require('./routes/dishRouter');
var promotionsRouter = require('./routes/promotionRouter');
var leadersRouter = require('./routes/leaderRouter');

//To establish coneection to mongodb server with mongoose
const mongoose=require("mongoose");
const Dishes =require("./models/dishes");
const url = config.mongoUrl;
const connect=mongoose.connect(url);
connect.then((db)=>{
  console.log("Connected to the Database")
},(err)=>{console.log(err);});


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser("12345-67890-09876-54321"));



//if user is logged in session is initiated 
//req.user will be added when we make call to passport.authnticate in login route
//passport session that we have done below will automatically serialize that user information and store it into session
//and when next time user sends session cookie then this will load req.user automaticallyu in request
app.use(passport.initialize());


//Before login/authenticating user can only acess index or user router
app.use('/', indexRouter);
app.use('/users', usersRouter);


app.use(express.static(path.join(__dirname, 'public')));

//Now we are going to restrict only some routes instead of all endpoints

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
