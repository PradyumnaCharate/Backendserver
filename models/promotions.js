const mongoose=require("mongoose");
const Schema=mongoose.Schema;
require("mongoose-currency").loadType(mongoose);
mongoose.plugin(schema => { schema.options.usePushEach = true });
//this wiull add currency to mongoose types
var Currency=mongoose.Types.Currency;


var promotionsSchema=new Schema({
    name:{
        type:String,
        required:true,
        unique:true
},
    image:{
        type:String,
        required:true
    },
    label:{
        type:String,
        default:" "

    },
    price:{
        type:Currency,
        required:true,
        min:true
    },
    description:{
        type:String,
        required:true,

    },
    featured:{
        type:Boolean,
        default:false
    }

},{timestamp:true}
);

var Promotions=mongoose.model("Promotion",promotionsSchema);
module.exports=Promotions;