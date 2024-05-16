const Genre = require("../models/genre");
const Book = require("../models/book")
const {body, validationResult} = require("express-validator")
const asyncHandler = require("express-async-handler");

// Display list of all Genre.
exports.genre_list = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Genre list");
  const allGenres = await Genre.find({}).sort({name:1}).exec();
  res.render("genre_list",{
    title: "Genre list",
    genre_list: allGenres,
  })

});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
  // res.send(`NOT IMPLEMENTED: Genre detail: ${req.params.id}`);
  // get details of genre and all ssociated books in parallel
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({genre:req.params.id},"title summary").exec(),
  ])

  if (genre==null){
    //etf is this 
    //no results
    const err = new Error("Genre not found") //wtf is new error
    //this is an error object
    err.status = 404;
    return next(err);
  }

  res.render("genre_detail",{
    title:"Genre Detail",
    genre:genre,
    genre_books: booksInGenre
  })
});

// Display Genre create form on GET.
exports.genre_create_get =  (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Genre create GET");
  res.render("genre_form",{title:"Create Genre"})
};
//remove the async handler, no need for asyncHandler because it doesnt contain code that
// can throw an acception

// Handle Genre create on POST.
// exports.genre_create_post = asyncHandler(async (req, res, next) => {
//   // res.send("NOT IMPLEMENTED: Genre create POST");


// });
exports.genre_create_post=[
  //validate and sanitize the name field
  body("name","Genre name must contain at least 3 characters")
  .trim()
  .isLength({min:3})
  .escape(),

  asyncHandler(async (req,res,next)=>{
    const errors = validationResult(req);
    //create a genre object
    const genre = new Genre({name:req.body.name});
    if (!errors.isEmpty()){
      //there are errors. render the form with sanitized values/msgs
      res.render("genre_form",{
        title:"Create Genre",
        genre:genre,
        errors: errors.array(),
      });
      return;
    } else{
      //no errors, data is valid
      const genreExists = await Genre.findOne({name:req.body.name}).collation({locale:"en",strength:2}).exec();
      //https://www.mongodb.com/docs/manual/reference/collation/
      //notes on collation. basically strength 2 ignores accents and letter casing
      if (genreExists){
        res.redirect(genreExists.url);
      } else{
        await genre.save();
        res.redirect(genre.url);
      }
    }
  })
]

// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Genre delete GET");
  const [genre,allBooksWithGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({genre:req.params.id},"title summary").exec()
  
  ])

  if (genre===null){
    // no such genre with id in the params
    res.redirect("/catalog/genres")
  }

  //render the delete form
  res.render("genre_delete",{
    //display all genres anyways because they should know
    title: "Delete Genre",
    genre: genre,
    genre_books: allBooksWithGenre
  })
});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Genre delete POST");

  const [genre,allBooksWithGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({genre:req.params.id},"title summary").exec()
  ])

  if (allBooksWithGenre.length>0){
    res.render("author_delete",{
      title: "Delete genre",
      genre: genre,
      genre_books: allBooksWithGenre
    })
    return;
  } else{
    await Genre.findByIdAndDelete(req.body.genreid);
    res.redirect('/catalog/genres')
  }
});

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Genre update GET");
  const genre = await Genre.findById(req.params.id).exec();
  if (genre===null){
    //no such genre
    const err = new Error("genre not found");
    err.status = 404;
    return next(err);
  }

  res.render("genre_form",{
    title: "Update Genre",
    genre:genre
  })
});

// Handle Genre update on POST.
// exports.genre_update_post = asyncHandler(async (req, res, next) => {
//   res.send("NOT IMPLEMENTED: Genre update POST");
// });

exports.genre_update_post = [
  body("name", "Genre must be minimum 3 character")
    .trim()
    .isLength({min:3})
    .escape(),


  asyncHandler(async(req,res,next)=>{
    const errors = validationResult(res);

    const genre = new Genre({
      name:req.body.name,
      _id: req.params.id
    })

    if (!errors.isEmpty()){
      res.render("genre_form",{
        title: "Update Genre",
        genre:genre,
        errors: errors.array()
      })
      return;
    } else{
      await Genre.findByIdAndUpdate(req.params.id,genre)
      res.redirect(genre.url);
    }
  })
]
