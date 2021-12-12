const express = require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const Dishes=require("../models/dishes");

const dishRouter=express.Router();
dishRouter.use(bodyParser.json());
dishRouter.route("/")
//we dont need app.all here because route is working.and also /dishes is not needed
.all((req,res,next)=>{
    res.statusCode=200;
    res.setHeader("Content-Type","text/plain");
    next();
    //this next will look for next request coming like get or put for /dishes endpoint and this will also happen
    //so same request and res coming here as argument will be passed to next get/whatever request
    //i.e if we modify the res/req here then modified req/res will be sent to next app.get 



})//we dont have have semicolon here.We have it only at the end.because this all route is single unit here.
.get((req,res,next)=>{
    res.end("Will send back all the Dishes to youu!!");
    //1stly app.all will happen and then this will happen and then because res.end is called this will send the output to client and this will end 
})

//now if we get a post request for dishes then app.all will execute firstly and because of next that will be dropped to this post
//because this is post request body will contain some information in json format
.post((req,res,next)=>{
    res.end("Will add the dish: "+ req.body.name + "with details" + req.body.description)

})


.put((req,res,next)=>{
    res.statusCode=403;
    res.end("Put Not Supported")

})

.delete((req,res,next)=>{
    res.end("Deleting All Dishes")

});

dishRouter.route("/:dishId")
.all((req,res,next)=>{
    res.statusCode=200;
    res.setHeader("Content-Type","text/plain");
    next();
})
//if parameter comes in like dishId we can refer this id by accessing req.params.param_name
.get((req,res,next)=>{
    res.end("Will send details of the Dish: "+ req.params.dishId + "to youu!");
    //1stly app.all will happen and then this will happen and then because res.end is called this will send the output to client and this will end 
})

//now if we get a post request for dishes then app.all will execute firstly and because of next that will be dropped to this post
//because this is post request body will contain some information in json format
.post((req,res,next)=>{
    res.statusCode=403;
    res.end("Post Not Supported on " + req.params.dishId  )

})


.put((req,res,next)=>{
    res.write("Updating the Dish" + req.params.dishId + "\n")
    res.end("Will update the dish " + req.body.name + "with details" + req.body.description);

})

.delete((req,res,next)=>{
    res.end("Deleting Dish with dishId: "+ req.params.dishId)

});


module.exports=dishRouter;
