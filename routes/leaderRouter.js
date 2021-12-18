const express = require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const Leaders=require("../models/leaders");
const authenticate=require("../authenticate");
const cors=require("./cors");
const leaderRouter=express.Router();
leaderRouter.use(bodyParser.json());
leaderRouter.route("/")
//we dont need app.all here because route is working.and also /Leaders is not needed
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next)=>{
    Leaders.find({})
    .then((leaders)=>{
        res.statusCode=200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leaders);
    },(err)=>next(err))
    .catch((err)=>next(err));
    //1stly app.all will happen and then this will happen and then because res.end is called this will send the output to client and this will end 
})

//now if we get a post request for Leaders then app.all will execute firstly and because of next that will be dropped to this post
//because this is post request body will contain some information in json format
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Leaders.create(req.body)
    .then((leader)=>{
        res.statusCode=200,
        res.setHeader("Content-Type","application/json");
        res.json(leader);
    },(err)=>next(err))
    .catch((err)=>next(err));

})


.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    res.statusCode=403;
    res.end("Put Not Supported")

})

.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Leaders.remove({})
    .then((resp)=>{
        res.statusCode=200,
        res.setHeader("Content-Type","application/json");
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));

});

leaderRouter.route("/:leaderId")
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
//if parameter comes in like leaderId we can refer this id by accessing req.params.param_name
.get(cors.cors,(req,res,next)=>{
    Leaders.findById(req.params.leaderId)
    .then((leader)=>{
        res.statusCode=200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leader);
    },(err)=>next(err))
    .catch((err)=>next(err));
})

//now if we get a post request for Leaders then app.all will execute firstly and because of next that will be dropped to this post
//because this is post request body will contain some information in json format
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    res.statusCode=403;
    res.end("Post Not Supported on " + req.params.leaderId  )

})


.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Leaders.findByIdAndUpdate(req.params.leaderId,{$set:req.body},{new:true})
    .then((leader)=>{
        res.statusCode=200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leader);
    },(err)=>next(err))
    .catch((err)=>next(err));
    
})

.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Leaders.findByIdAndRemove(req.params.leaderId)
    .then((resp)=>{
        res.statusCode=200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));

});




module.exports=leaderRouter;

