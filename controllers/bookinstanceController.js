const BookInstance = require("../models/bookinstance");
const asyncHandler = require("express-async-handler");
const {body, validationResult} = require("express-validator");
const Book = require("../models/book");
const book = require("../models/book");

// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: BookInstance list");.exec
  const allBookInstances = await BookInstance.find().populate("book").exec();

  res.render("bookinstance_list",{
    title: "Book Instance List",
    bookinstance_list: allBookInstances,
  })
});



// Display detail page for a specific BookInstance.
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  // res.send(`NOT IMPLEMENTED: BookInstance detail: ${req.params.id}`);
  const bookInstance = await BookInstance.findById(req.params.id).populate("book").exec();
  if (bookInstance==null){
    const err = new Error("Book copy not found")
    err.status = 404
    return next(err)
  }
  res.render("bookinstance_detail",{
    titke: "Book:",
    bookinstance: bookInstance
  })
});

// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: BookInstance create GET");
  const allBooks = await Book.find({},"title").sort({title:1}).exec();
  res.render("bookinstance_form",{
    title:"Create BookInstance",
    book_list:allBooks
  })
});

// Handle BookInstance create on POST.
// exports.bookinstance_create_post = asyncHandler(async (req, res, next) => {
//   res.send("NOT IMPLEMENTED: BookInstance create POST");
// });

exports.bookinstance_create_post = [
  body("book","Book must be specified").trim().isLength({min:1}).escape(),
  body("imprint","Imprint must be specified").trim().isLength({min:1}).escape(),
  body("status").escape(),
  body("due_back","Invalid date").optional({values:"falsy"}).isISO8601().toDate(),

  asyncHandler(async(req,res,next)=>{
    const errors = validationResult(req);
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status:req.body.status,
      due_back:req.body.due_back,
    })

    if (!errors.isEmpty()){
      const allBooks = await Book.find({},"title").sort({title:1}).exec();

      res.render("bookinstance_form",{
        title: "Create BookInstance",
        book_list: allBooks,
        selected_book: bookInstance.book._id,
        errors: errors.array(),
        bookinstance: bookInstance,
      });

      return; //end of the error segment
    } else{
      //data from form valid
      await bookInstance.save();
      res.redirect(bookInstance.url)
    }
  })
]

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: BookInstance delete GET");
  const bookinstance = await BookInstance.findById(req.params.id).exec();
  if (bookinstance ===null){
    //no result of such instance
    res.redirect('/catalog/bookinstances');
  }

  //render delete page
  res.render("bookinstance_delete",{
    title: "Delete Book Instance",
    book_instance: bookinstance
  })


});

// Handle BookInstance delete on POST.,jdelete POST");
// });
exports.bookinstance_delete_post = asyncHandler(async(req,res,next)=>{
  //get details of the book
  //there is no need to get the bookinstnace details? becausethis was initially designed for an error amesage 
  // const bookinstance = await BookInstance.findById(req.params.id).exec();
  await BookInstance.findByIdAndDelete(req.body.bookinstanceid);
  res.redirect("/catalog/bookinstances")

  //is there a need for error handling? book instance has no dependencies 
  // if (bookinstance===null){
  //   //no
  // }
})

// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: BookInstance update GET");
});

// Handle bookinstance update on POST.
exports.bookinstance_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: BookInstance update POST");
});
