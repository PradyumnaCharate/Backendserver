const express = require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const Dishes=require("../models/dishes");
const authenticate=require("../authenticate");

const dishRouter=express.Router();
dishRouter.use(bodyParser.json());
dishRouter.route("/")

//In this we dont need all ..we will handle each get post request indivisually
.get((req,res,next)=>{
    Dishes.find({})
    .then((dishes) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dishes);
    }, (err) => next(err))
    .catch((err) => next(err));
})

//now if we get a post request for dishes then app.all will execute firstly and because of next that will be dropped to this post
//because this is post request body will contain some information in json format

//If post request comes then we will first check jwt token with verifyUser.
.post(authenticate.verifyUser,(req,res,next)=>{
    Dishes.create(req.body)
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));

})


.put(authenticate.verifyUser,(req,res,next)=>{
    res.statusCode=403;
    res.end("Put Not Supported")

})

.delete(authenticate.verifyUser,(req,res,next)=>{
    Dishes.remove({})
    .then((dishes) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dishes);
    }, (err) => next(err))
    .catch((err) => next(err));

});

dishRouter.route("/:dishId")
//if parameter comes in like dishId we can refer this id by accessing req.params.param_name
.get((req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})

//now if we get a post request for dishes then app.all will execute firstly and because of next that will be dropped to this post
//because this is post request body will contain some information in json format
.post(authenticate.verifyUser,(req,res,next)=>{
    res.statusCode=403;
    res.end("Post Not Supported on " + req.params.dishId  )
    

})


.put(authenticate.verifyUser,(req,res,next)=>{
    Dishes.findByIdAndUpdate(req.params.dishId,{$set:req.body
    },{new:true})
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.delete(authenticate.verifyUser,(req,res,next)=>{
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
});

dishRouter.route("/:dishId/comments")

.get((req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if(dish!=null){  res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments);
        }
        else{
            err=new Error("Dish "+ req.params.dishId +" not Found!");
            err.statusCode=404;
            return next(err);
        }
      
    }, (err) => next(err))
    .catch((err) => next(err));
})

//now if we get a post request for dishes then app.all will execute firstly and because of next that will be dropped to this post
//because this is post request body will contain some information in json format
.post(authenticate.verifyUser,(req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null) {
            dish.comments.push(req.body);
            dish.save()
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);                
            }, (err) => next(err));
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.put(authenticate.verifyUser,(req,res,next)=>{
    res.statusCode=403;
    res.end("Put Not Supported")

})

.delete(authenticate.verifyUser,(req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if(dish!=null){
            for (var i = (dish.comments.length -1); i >= 0; i--) {
                dish.comments.id(dish.comments[i]._id).remove();
            }
            dish.save()
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);                
            }, (err) => next(err));
        }
        else{
            err=new Error("Dish "+ req.params.dishId +" not Found!");
            err.statusCode=404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));

});

dishRouter.route("/:dishId/comments/:commentId")
//if parameter comes in like dishId we can refer this id by accessing req.params.param_name
.get((req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments.id(req.params.commentId));
        }
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

//now if we get a post request for dishes then app.all will execute firstly and because of next that will be dropped to this post
//because this is post request body will contain some information in json format
.post(authenticate.verifyUser,(req,res,next)=>{
    res.statusCode=403;
    res.end("Post Not Supported on " + req.params.dishId  )
    

})


.put(authenticate.verifyUser,(req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
            if (req.body.rating) {
                dish.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if (req.body.comment) {
                dish.comments.id(req.params.commentId).comment = req.body.comment;                
            }
            dish.save()
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);                
            }, (err) => next(err));
        }
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.delete(authenticate.verifyUser,(req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
            dish.comments.id(req.params.commentId).remove();
            dish.save()
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);                
            }, (err) => next(err));
        }
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});



module.exports=dishRouter;
