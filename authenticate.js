//STore of authentication strategies
var passport=require("passport");
var LocalStrategy=require("passport-local") .Strategy;
var User=require("./models/user");
//json web tokken based strategy
var JwtStrategy=require("passport-jwt").Strategy;
var ExtractJwt=require("passport-jwt").ExtractJwt;
var jwt=require("jsonwebtoken");
var config=require("./config");


//passport extract  username and password from message body use and supply parameters to verify function we will supply to local strategy 
exports.local=passport.use(new LocalStrategy(User.authenticate()));//We can also write our own authentication function we implemented previously 
//but this User.authenticate is provided by mongoose passport itself.


//takes user info from request 
//These 2 functions are provided by passport local mongoose plugin on USER schema we used in user.js
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//This function when supplied by json object user will create a token for us
exports.getToken=function(user){
    return jwt.sign(user,config.secretKey,
        {expiresIn:3600})

}

var opts={};//options to specify jwt strategy
//ExtractJWt provides ways to extract web tokens from body or auth header 
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();//from header of request
opts.secretOrKey=config.secretKey;//helps to extract secretkey used withing strategy to sign


//passport strategy like local strategy

//it takes options as 1 st parameter and verify function callback as 2 nd parameter.
//Whenever this function is called,,,done is callback provided by passport.When we are configuring passport with new strategy
//We have to provide done as 2nd paraamter to callback function.Through this done paramter it will be passing back the info
//to passport which then it will use to load things into request message as per strategy 
exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) =>{
    console.log("JWT payload: ",jwt_payload);
    User.findOne({_id:jwt_payload._id},(err,user)=>{
        if(err){
            //passport will pass this done to ur strategy
            //done takes 3 parameters.1.error if any 2.If user exists then user will be passed 3.info 
            return done(err,false)//false because there is an error.
        }
        else if(user){
            return done(null,user);//no error so null and user is found then user is passed 

        }
        else{
            return (null,false);//user is not found
             
        }

    })



}));


//function to verify incoming user with token we will use jwt strategy we just implemented
exports.verifyUser=passport.authenticate("jwt",{session:false});
//We are not going to create sessions
//similar to passport.authenticate("local") used in /login route.here we have used jwt instead of local




//After succesfull login client will get token and for each request afterwards it wil include it in authentication header.
//opts.JwtFromRequest=ExtractJwt.fromAuthHeaderAsBearerToken(); this happens becuase due to this line 



exports.verifyAdmin=function(req,res,next){
    if (req.user.admin){
        next();
    }
    else{
        err = new Error("You are not authorized to perform this operation!");
        err.status = 403;
        return next(err);         
    }

}

