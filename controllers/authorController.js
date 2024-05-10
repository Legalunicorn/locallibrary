const Author = require("../models/author")
const asyncHandler = require("express-async-handler");


//display list of all authors
exports.author_list = asyncHandler(async(req,res,next)=>{
    res.send("NOT IMPLEMENTED - AUTHOR LIST")
})

//DISPLAY DETAIL PAGE FOR SPECIFIC author
exports.author_detail = asyncHandler(async (req,res,next)=>{
    res.send(`NOT IMPLEMENTS: author detail: ${req.params.id}`)
})

//display author create form on GET 
exports.author_create_get = asyncHandler(async(req,res,next)=>{
    res.send("not implemented: author create get")
})


// handle author create on post
exports.author_create_post = asyncHandler(async(req,res,next)=>{
    res.send("not imple: author create post")
})

//dissplay author delete form on get
exports.author_delete_get = asyncHandler(async(req,res,next)=>{
    res.send("not implet: author del GET")
})

exports.author_delete_post = asyncHandler(async(req,res,next)=>{
    res.send("not impl : author delete POST")
})

exports.author_update_get = asyncHandler(async(req,res,next)=>{
    res.send("not implete: author update GWT")
})

exports.author_update_post = asyncHandler(async(req,res,next)=>{
    res.send("not implete: author update POST")
})