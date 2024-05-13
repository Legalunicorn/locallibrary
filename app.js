//import useful node libraries
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan'); //middleware


//takes the ROUTERS in our "routes" folder, we can add as wish etc
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const cataglogRouter = require("./routes/catalog") //import routes for "catalog" area of site


//create an app object , use it to set up the view engine
var app = express();


// // Set up mongoose conneciton
const mongoose = require("mongoose");
mongoose.set("strictQuery",false);
const mongoDB = "mongodb+srv://hiroc:430467Lol@cluster0.yfd1p7a.mongodb.net/local_library?retryWrites=true&w=majority";

main().catch((err)=> console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}
// //

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug'); //pug as we set during express generator


/*
THese call app.use() to add the MIDDLEWARE libraries (imported aboe)
*/
app.use(logger('dev'));
app.use(express.json()); //eg, this is used to populate req.body with form fields
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); //serve static files in the "public" folder


//MIDDLEWARE has been set up, we can use() our routers as imported above
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/catalog",cataglogRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
