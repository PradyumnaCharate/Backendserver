const express = require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const Promotions=require("../models/promotions");

const promotionRouter=express.Router();
promotionRouter.use(bodyParser.json());
promotionRouter.route("/")
//we dont need app.all here because route is working.and also /dishes is not needed
.get((req,res,next)=>{
    Promotions.find({})
    .then((promotions)=>{
        res.statusCode=200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotions);
    },(err)=>next(err))
    .catch((err)=>next(err));
    //1stly app.all will happen and then this will happen and then because res.end is called this will send the output to client and this will end 
})

//now if we get a post request for promotions then app.all will execute firstly and because of next that will be dropped to this post
//because this is post request body will contain some information in json format
.post((req,res,next)=>{
    Promotions.create(req.body)
    .then((promotion)=>{
        res.statusCode=200,
        res.setHeader("Content-Type","application/json");
        res.json(promotion);
    },(err)=>next(err))
    .catch((err)=>next(err));

})


.put((req,res,next)=>{
    res.statusCode=403;
    res.end("Put Not Supported")

})

.delete((req,res,next)=>{
    Promotions.remove({})
    .then((resp)=>{
        res.statusCode=200,
        res.setHeader("Content-Type","application/json");
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));

});

promotionRouter.route("/:promotionId")

//if parameter comes in like promotionId we can refer this id by accessing req.params.param_name
.get((req,res,next)=>{
    Promotions.findById(req.params.promotionId)
    .then((promotion)=>{
        res.statusCode=200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    },(err)=>next(err))
    .catch((err)=>next(err));
})

//now if we get a post request for Promotions then app.all will execute firstly and because of next that will be dropped to this post
//because this is post request body will contain some information in json format
.post((req,res,next)=>{
    res.statusCode=403;
    res.end("Post Not Supported on " + req.params.promotionId  )

})


.put((req,res,next)=>{
    Promotions.findByIdAndUpdate(req.params.promotionId,{$set:req.body},{new:true})
    .then((promotion)=>{
        res.statusCode=200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    },(err)=>next(err))
    .catch((err)=>next(err));
    
})

.delete((req,res,next)=>{
    Promotions.findByIdAndRemove(req.params.promotionId)
    .then((resp)=>{
        res.statusCode=200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));

});






module.exports=promotionRouter;