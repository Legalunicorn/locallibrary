const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre")
const BookInstance = require('../models/bookinstance')

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

// Display detail page for a specific book.
exports.book_detail = asyncHandler(async (req, res, next) => {
  res.send(`NOT IMPLEMENTED: Book detail: ${req.params.id}`);
});

// Display book create form on GET.
exports.book_create_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book create GET");
});

// Handle book create on POST.
exports.book_create_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book create POST");
});

// Display book delete form on GET.
exports.book_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book delete GET");
});

// Handle book delete on POST.
exports.book_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book delete POST");
});

// Display book update form on GET.
exports.book_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book update GET");
});

// Handle book update on POST.
exports.book_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book update POST");
});
