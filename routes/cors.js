const express=require("express");
const cors=require("cors");
const app=express();
const whitelist=['http://localhost:3000', 'https://localhost:3443'];
var corsOptionsDelegate=(req,callback)=>{
        var corsOptions;
        //if req header origin contains our whitelist url then it will return index of that which will be greater than 0 or 0
        //so if it is not -1 then origin is present in whitelist.
        //then we will set cors options true then cors module will say acess control allow origin and include that origin in header  
        if(whitelist.indexOf(req.header("Origin"))!==-1){
            corsOptions={origin:true};
        }
        else{
            corsOptions={origin:false};//DOnt access that particular origin
        }
        callback(null,corsOptions)
    }
 
exports.cors=cors();//Exporting normal cors without configuring (Random url allowed for get requests)
exports.corsWithOptions=cors(corsOptionsDelegate);//(configured cors)