var mongoose=require("mongoose");
var Schema=mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var User=new Schema({
    //we dont need username and password fields because password-local-mongoose is adding it already
    admin:{
        type:Boolean,
        default:false
    }

});

//this will add this password system which includes safe hash and salt techniques
User.plugin(passportLocalMongoose);


module.exports=mongoose.model("User",User);