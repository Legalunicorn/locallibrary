const mongoose = require("mongoose")

const Schema = mongoose.Schema;

const BookInstanceSchema = new Schema({
    book:{type:Scheme.Types.ObjectId, ref:"Book",required:true},
    imprint:{type:String,required:true},
    status:{
        type:String,
        required:true,
        enum:["Available","Maintenance","Loaned","Reserved"]
    },
    due_back:{type:Date,default:Date.now}
})

//virtual instance

BookInstanceSchema.virtual("url").get(function(){
    return `/catalog/bookinstance/${this._id}`
})

module.exports = mongoose.model("BookInstance",BookInstanceSchema)