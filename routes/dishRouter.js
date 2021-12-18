const express = require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const Dishes=require("../models/dishes");
const authenticate=require("../authenticate");
const cors=require("./cors");

const dishRouter=express.Router();
dishRouter.use(bodyParser.json());
dishRouter.route("/")


//here setting options field whenever you need to preflight your request client will send 1st http options message 
//and obtain reply from server side before it actually sends actual request
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
//In this we dont need all ..we will handle each get post request indivisually
.get(cors.cors,(req,res,next)=>{
    Dishes.find({})
    .populate("comments.author")//WHen dishes document is construucted to send back to user we are gonna populate author 
    //with user document
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
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Dishes.create(req.body)
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));

})


.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    res.statusCode=403;
    res.end("Put Not Supported")

})

.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
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
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .populate("comments.author")
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})

//now if we get a post request for dishes then app.all will execute firstly and because of next that will be dropped to this post
//because this is post request body will contain some information in json format
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    res.statusCode=403;
    res.end("Post Not Supported on " + req.params.dishId  )
    

})


.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Dishes.findByIdAndUpdate(req.params.dishId,{$set:req.body
    },{new:true})
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
});

dishRouter.route("/:dishId/comments")
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .populate("comments.author")
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
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null) {
            req.body.author=req.user._id;//we are creating req.body.author by copying req.user._id which is created by 
            //authenticate.verifyUser(passport-jwt adds this) and added user to request messsage
            dish.comments.push(req.body);
            dish.save()
            .then((dish) => {
                Dishes.findById(dish._id)
                .populate('comments.author')
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);
                })                           
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

.put(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    res.statusCode=403;
    res.end("Put Not Supported")

})

.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
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
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .populate("comments.author")
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
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    res.statusCode=403;
    res.end("Post Not Supported on " + req.params.dishId  )
    

})


.put(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
            if (req.user._id.equals(dish.comments.id(req.params.commentId).author)){
                if (req.body.rating) {
                    dish.comments.id(req.params.commentId).rating = req.body.rating;
                }
                if (req.body.comment) {
                    dish.comments.id(req.params.commentId).comment = req.body.comment;                
                }
                dish.save()
                .then((dish) => {
                    Dishes.findById(dish._id)
                    .populate('comments.author')
                    .then((dish) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish);  
                    })              
                }, (err) => next(err));
            }
            else{
                err = new Error("This is not your comment,You are not authorized to perform this operation!");
                err.status = 403;
                return next(err);      
            }
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

.delete(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
            if (req.user._id.equals(dish.comments.id(req.params.commentId).author)){
                dish.comments.id(req.params.commentId).remove();
                dish.save()
                .then((dish) => {
                Dishes.findById(dish._id)
                .populate('comments.author')
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);  
                })              
            }, (err) => next(err));

            }
            else{
                err = new Error("This is not your comment,You are not authorized to perform this operation!");
                err.status = 403;
                return next(err);      
            }
            
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
