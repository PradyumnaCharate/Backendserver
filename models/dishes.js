const mongoose=require("mongoose");
const Schema=mongoose.Schema;
require("mongoose-currency").loadType(mongoose);
mongoose.plugin(schema => { schema.options.usePushEach = true });
//this wiull add currency to mongoose types
var Currency=mongoose.Types.Currency;

//This is subdocument which will be used in document dishes as comments array
var commentSchema = new Schema({
    rating:  {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment:  {
        type: String,
        required: true
    },
    author:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'//Connecting to User model it will store object Id of User
    }
}, {
    timestamps: true
});

const dishSchema=new Schema({
    name:{
        type:String,
        required:true,
        unique:true

    },
    description:{
        type:String,
        required:true,

    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    label: {
        type: String,
        default: ''
    },
    price: {
        type: Currency,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default:false      
    },

    comments:[commentSchema]
},
{
    timestamps:true    
}
);

//mongoose will automatically create plural of dish and create collections of that name
var Dishes=mongoose.model("Dish",dishSchema);
module.exports=Dishes;