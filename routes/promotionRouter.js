const express = require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const Promotions=require("../models/promotions");
const authenticate=require("../authenticate");
const cors=require("./cors");

const promotionRouter=express.Router();
promotionRouter.use(bodyParser.json());
promotionRouter.route("/")
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
//we dont need app.all here because route is working.and also /dishes is not needed
.get(cors.cors,(req,res,next)=>{
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
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Promotions.create(req.body)
    .then((promotion)=>{
        res.statusCode=200,
        res.setHeader("Content-Type","application/json");
        res.json(promotion);
    },(err)=>next(err))
    .catch((err)=>next(err));

})


.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    res.statusCode=403;
    res.end("Put Not Supported")

})

.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Promotions.remove({})
    .then((resp)=>{
        res.statusCode=200,
        res.setHeader("Content-Type","application/json");
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));

});

promotionRouter.route("/:promotionId")
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
//if parameter comes in like promotionId we can refer this id by accessing req.params.param_name
.get(cors.cors,(req,res,next)=>{
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
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    res.statusCode=403;
    res.end("Post Not Supported on " + req.params.promotionId  )

})


.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Promotions.findByIdAndUpdate(req.params.promotionId,{$set:req.body},{new:true})
    .then((promotion)=>{
        res.statusCode=200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    },(err)=>next(err))
    .catch((err)=>next(err));
    
})

.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Promotions.findByIdAndRemove(req.params.promotionId)
    .then((resp)=>{
        res.statusCode=200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));

});






module.exports=promotionRouter;