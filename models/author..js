//copied 

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
    first_name:{type:String, required:true,maxLenfth:100},
    family_name:{type:String, required:true},
    date_of_birth:{type:Date},
    date_of_death:{type:Date},
})



// virtual for authors FULL NAME
AuthorSchema.virtual("name").get(function(){
    //to avoid errors in cases where author dh either a first name
    // or a full name, we make sure we handle exceptions
    let fullname = "";
    if (this.first_name && this.family_name){
        fullname = `${this.family_name}, ${this.first_name}`
    }
    return fullname;
})


//vurtual for authors URL
AuthorSchema.virtual("url").get(function(){
    return `/catalog/author/${this._id}`
})


//EXPORT MODEL
module.exports = mongoose.model("Author",AuthorSchema);