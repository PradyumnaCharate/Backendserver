const mongoose=require("mongoose");
const Schema=mongoose.Schema;
require("mongoose-currency").loadType(mongoose);
mongoose.plugin(schema => { schema.options.usePushEach = true });
//this wiull add currency to mongoose types
var Currency=mongoose.Types.Currency;


var leaderSchema=new Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    image:{
        type:String,
        required:true
    },
    designation:{
        type:String,
        required:true
    },
    abbr:{
        type:String,
        required:true

    },
    description:{
        type:String,
        required:true
    },
    featured:{
        type:Boolean,
        default:false
    }

},{timestamp:true}
);

var Leaders=mongoose.model("Leader",leaderSchema);
module.exports=Leaders;