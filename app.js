var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var studentRouter = require('./routes/student');
var hodRouter = require('./routes/hod');
var teacherRouter = require('./routes/teacher');

var hbs = require('express-handlebars');
const db = require('./config/connection');
const session = require('express-session');
var app = express();
var hbs = require('express-handlebars');

const customHelpers = {
  eq: (a, b) => a === b, // Check if two values are equal
  increment: (value) => parseInt(value) + 1, // Increment a value by 1
  json: (context) => JSON.stringify(context, null, 2), // Convert data to JSON string (pretty print)
  
  // Custom helper to check if two values are equal
  ifCond: (timeSlot, time, options) => {
    if (timeSlot === time) {
      return options.fn(this); // Render if the times match
    } else {
      return options.inverse(this); // Don't render if times don't match
    }
  },

  // Custom 'or' helper to check if either of the two conditions is true
  or: function (a, b, options) {
    if (a || b) {
      return options.fn(this); // Return block if any condition is true
    } else {
      return options.inverse(this); // Return else block if both conditions are false
    }
  }
};



// Set up view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine(
  'hbs',
  hbs.engine({
    extname: 'hbs', // File extension for templates
    defaultLayout: 'layout', // Default layout file
    layoutsDir: path.join(__dirname, 'views', 'layout/'), // Directory for layouts
    partialsDir: path.join(__dirname, 'views/partials/'), // Directory for partials
    helpers: customHelpers, // Register helpers globally
  })
);
// db connection
db.connect((err) => {
  if (err) throw err;
  console.log('Db Connected');
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'dms', cookie: { maxAge: 600000 } }));
app.use('/', studentRouter);
app.use('/hod', hodRouter);
app.use('/teacher', teacherRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
