const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require('../models/bookinstance');
const {body, validationResult} = require("express-validator");

const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Site Home Page");
  //get details of books, book instances, authors and genre counts 
  //(in parallel)

  const [
    numBooks,
    numBookInstances,
    numAvailableBookInstances,
    numAuthors,
    numGenres,
  ] = await Promise.all([
    Book.countDocuments({}).exec(),
    BookInstance.countDocuments({}).exec(),
    BookInstance.countDocuments({status:"Available"}).exec(),
    Author.countDocuments({}).exec(),
    Genre.countDocuments({}).exec(),
  ]); //promise.all runs in parallel

  res.render("index",{
    title: "Local Library Home",
    book_count: numBooks,
    book_instance_count: numBookInstances,
    book_instance_available_count: numAvailableBookInstances,
    author_count: numAuthors,
    genre_count:numGenres,
  })
});

// Display list of all books.
exports.book_list = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({},"title author") //return only title and author values, along with id and virtual fields
  //await function, pause the execution untol it is settled
    .sort({title:1}) //sort the results by title
    .populate("author") //will retrive the author information from author model, since currently its just refereced by the obkect
    .exec();

  //if the promise is fulfiled, the results are saved to all Books and the handler continues execution
  res.render("book_list",{title:"Book List", book_list:allBooks})
});


exports.book_detail = asyncHandler(async (req, res, next) => {
  // Get details of books, book instances for specific book
  const [book, bookInstances] = await Promise.all([
    Book.findById(req.params.id).populate("author").populate("genre").exec(),
    BookInstance.find({ book: req.params.id }).exec(),
  ]);

  if (book === null) {
    // No results.
    const err = new Error("Book not found");
    err.status = 404;
    return next(err);
  }

  res.render("book_detail", {
    title: book.title,
    book: book,
    book_instances: bookInstances,
  });
});  

// Display book create form on GET.
exports.book_create_get = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Book create GET");
  //get all the authordd and genres, whic hwe can use for added to our book
  const [allAuthors, allGenres] = await Promise.all([
    Author.find().sort({family_name:1}).exec(),
    Genre.find().sort({name:1}).exec(),
  ])

  res.render("book_form",{
    title: "Create Book",
    authors: allAuthors,
    genres: allGenres
  })
});

// Handle book create on POST.
// exports.book_create_post = asyncHandler(async (req, res, next) => {
//   res.send("NOT IMPLEMENTED: Book create POST");
// });
exports.book_create_post = [
  //convert genre to an array
  (req,res,next)=>{
    if (!Array.isArray(req.body.genre)){
      req.body.genre = typeof req.body.genre === "undefined" ? [] : [req.body.genre]
    }
    next();
  },

  //validate and sanitize fields
  body("title","Title must not be empty.")
    .trim()
    .isLength({min:1})
    .escape(),
  body("author","Author must not be empty.")
    .trim()
    .isLength({min:1})
    .escape(),
  body("summary","Summary must not be empty")
    .trim()
    .isLength({min:1})
    .escape(),
  body("isbn","ISBN must not me empty")
    .trim()
    .isLength({min:1})
    .escape(),
  body("genre.*").escape(),   //wild card 

  asyncHandler(async (req,res,next)=>{
    const errors = validationResult(req);
    const book = new Book({
      title:req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
    });

    if (!errors.isEmpty()){
      //there are errors
      //render form with sanitised values 
      const [allAuthors,allGenres] = await Promise.all([
        Author.find().sort({family_name:1}).exec(),
        Genre.find().sort({name:1}).exec(),

      ])

      //marked selected genres as checked
      for (const genre of allGenres){
        if (book.genre.includes(genre._id)){
          genre.checked ="true";
        }
      }
      res.render("book_form",{
        title: "Create Book",
        authors: allAuthors,
        genres: allGenres,
        book: book,
        errors: errors.array()      
      });
    } else{
      //valid
      await book.save();
      res.redirect(book.url);
    }
  })

]

// Display book delete form on GET.
exports.book_delete_get = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Book delete GET");
  //gets the page to confirm the book deletion
  // in order to delete a book, all book instances must be deleted first
  const [book, allBookInstances] = await Promise.all([
    Book.findById(req.params.id).exec(),
    BookInstance.find({book:req.params.id},"imprint status").exec(),
  ])

  if (book==null){
    //no suh book
    res.redirect("/catalog/books")
  }

  res.render("book_delete",{
    title: "Delete Books",
    book: book,
    book_instances: allBookInstances
  })


});

// Handle book delete on POST.
exports.book_delete_post = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Book delete POST");

  //sends a post reqest to the DB to delete the book
  // here we must check if there are still book instances or note
  const [book, allBookInstances] = await Promise.all([
    Book.findById(req.params.id).exec(),
    Book.find({author:req.params.id},"imprint status").exec(),
  ])

  if (allBookInstances.length>0){
    //delete book instances first 
    res.render("book_delete",{
      title: "Delete Book",
      book: book,
      book_instances: allBookInstances
    })
    return;
  } else{
      // proceed with book deletion
      await Book.findByIdAndDelete(req.body.bookid);
      res.redirect('/catalog/books');
  }


});

// Display book update form on GET.
exports.book_update_get = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Book update GET");
  const [book, allAuthors,allGenres] = await Promise.all([
    Book.findById(req.params.id).populate("author").exec(),
    Author.find().sort({family_name:1}).exec(),
    Genre.find().sort({name:1}).exec()
  ])

  if (book===null){
    const err = new Error("Book not found")
    err.status = 404;
    return next(err);
  }

  //mark selected generes as checekd
  allGenres.forEach(genre=>{
    if (book.genre.includes(genre._id)) genre.checked="true"
  })

  res.render("book_form",{
    title: "Update Book",
    authors: allAuthors,
    genres:allGenres,
    book:book
  })


});

// Handle book update on POST.
// exports.book_update_post = asyncHandler(async (req, res, next) => {
//   // res.send("NOT IMPLEMENTED: Book update POST");
// });

exports.book_update_post  = [
  //convert genre to array
  (req,res,next) =>{
    if (!Array.isArray(req.body.genre)){
      req.body.genre = typeof req.body.genre=="undefined" ?[] : [req.body.genre]
    }
    next();
  },

  body("title","Title must not be empty.")
    .trim().isLength({min:1}).escape(),
  body("author","Author must not be empty.").trim().isLength({min:1}).escape(),
  body("summary","Summary must not be empty.").trim().isLength({min:1}).escape(),
  body("isbn","ISBN must not be empty").trim().isLength({min:1}).escape(),
  body("genre.*").escape(),

  //process request after validatio and sanitidatoin

  asyncHandler(async (req,res,next)=>{
    //extract validation erros 
    const errors  = validationResult(req);
    //create book object with escaped/trimmed data and old id

    const book = new Book({
      title:req.body.title,
      author:req.body.author,
      summary:req.body.summary,
      isbn:req.body.isbn,
      genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
      _id: req.params.id, // THIS IS REQUIRED OR A NEW ID WILL BE ASSIGEND
      
    })
    if (!errors.isEmpty()){
      //there are errors 
      const [allAuthors, alLGenres] = await Promise.all([
        Author.find().sort({family_name:1}).exec(),
        Genre.find().sort({name:1}).exec()
      ]);

      for (const genre of allGenres){
        if (book.genre.indexOf(genre._id)>-1){
          genre.checked = "true";
        }
      }

      res.render("book_form",{
        title:"Update book",
        authors: allAuthors,
        genres:allGenres,
        book:book,
        errors:errors.array(),
      });
      return;

    } else{
      const updatedBook = await Book.findByIdAndUpdate(req.params.id,book,{});
      res.redirect(updatedBook.url)
    }

  })
]
