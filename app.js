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

//Before login/authenticating user can only acess index or user router
app.use('/', indexRouter);
app.use('/users', usersRouter);

function auth(req,res,next){

  console.log(req.session);
  //if no session
  if(!req.session.user) {
    var err = new Error('You are not authenticated!');
    err.status = 403;
    return next(err);
}
  else {
    //in user.js upon succesfull authentication we have set user to authenticated so wil check that here
    if (req.session.user === 'authenticated') {
      next();
    }
    else {
      var err = new Error('You are not authenticated!');
      err.status = 403;
      return next(err);
    }
  }
  

}

//Authentication first
app.use(auth);
app.use(express.static(path.join(__dirname, 'public')));



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
