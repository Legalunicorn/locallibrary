//copied 

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const {DateTime} = require("luxon");

const AuthorSchema = new Schema({
    first_name:{type:String, required:true,maxLength:100},
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

AuthorSchema.virtual("lifespan").get(function(){
    let dob,dod
    if (this.date_of_birth)  dob = DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED)
    else dob = ''
    if (this.date_of_death)  dod = DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED)
    else dod = ''

    return `${dob} - ${dod}`
})


AuthorSchema.virtual("dob_yyyy_mm_dd").get(function(){
    return DateTime.fromJSDate(this.date_of_birth).toISODate();
})
AuthorSchema.virtual("dod_yyyy_mm_dd").get(function(){
    return DateTime.fromJSDate(this.date_of_death).toISODate();
})


//EXPORT MODEL
module.exports = mongoose.model("Author",AuthorSchema);