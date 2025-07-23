var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/authRoutes'); // Import auth routes
var kelolaUserRouter = require('./routes/userRoutes'); // Import user management routes
var kelolaKKRouter = require('./routes/pendudukRoutes/datakkRoutes'); // Import family card management routes
var kelolaKepalaKeluargaRouter = require('./routes/pendudukRoutes/dataKepalaKeluagaRoutes'); // Import head of family management routes
var apbdesRouter = require('./routes/APBDesRoutes/APBDesRoutes'); // Import APBDes routes

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', authRouter); // Use auth routes
app.use('/users', usersRouter);
app.use('/kelola-user', kelolaUserRouter); // Use user management routes
app.use('/kelola-kk', kelolaKKRouter); // Use family card management routes
app.use('/kelola-kepala-keluarga', kelolaKepalaKeluargaRouter); // Use head of family management routes
app.use('/apbdes', apbdesRouter); // Use APBDes routes

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
