var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');
var session = require('express-session');
var passport = require('passport');
var dotenv = require('dotenv').config();

var User = require('./models/user');
var Event = require('./models/event');
var Follow = require('./models/follow');
var Eventfollow = require('./models/eventfollow');

User.sync().then(() => {
  Event.belongsTo(User, {foreignKey: 'createdBy'});
  Event.hasMany(Eventfollow, {foreignKey: 'eventfollowed'});
  Event.sync().then(() => {
    Eventfollow.belongsTo(Event, {foreignKey: 'eventfollowed'});
    Eventfollow.belongsTo(User, {foreignKey: 'follow'});
    Eventfollow.sync();
  });
});

Follow.sync().then(() => {
  User.hasMany(Follow, {foreignKey: 'followed'});
  User.sync();
});



var TwitterStrategy = require('passport-twitter').Strategy;
var TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
var TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(new TwitterStrategy({
  consumerKey: TWITTER_CONSUMER_KEY,
  consumerSecret: TWITTER_CONSUMER_SECRET,
  callbackURL: process.env.HEROKU_URL ? process.env.HEROKU_URL + 'auth/twitter/callback' : "http://localhost:8000/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    process.nextTick(function () {
      User.upsert({
        userId: profile.id,
        username: profile.username
      }).then(() => {
        Follow.upsert({
          follow: profile.id,
          followed: profile.id,
          followname: profile.username,
          followedname: profile.username
        }).then(() => {
          done(null, profile);
        });
      });
    });
  }
));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var logoutRouter = require('./routes/logout');
var eventsRouter = require('./routes/events');
var userRouter = require('./routes/user');

var app = express();
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: process.env.SECRET_KEY, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/events', eventsRouter);
app.use('/', userRouter);

app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { successRedirect: '/', failureRedirect: '/login' })
);

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
