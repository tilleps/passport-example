"use strict";


const express = require("express");
const app = express();

const sessionsMiddleware = require("./middleware/sessions");


const config = {
  session: {
    secret: "SECRET",
    key: "passport-example"
  }
};

app.use(express.static("./static"));
app.set("config", config);

//
//  Template/View Rendering Options
//
app.set("view engine", "ejs");  // Setting the template to use
app.set("views", __dirname + "/../views");


//
//  JSON Formatting
//
app.set("json replacer", function(key, value) {
  return typeof value === "undefined" ? null : value;
});

app.set("json spaces", 2);


//  Cookie Parser
const cookieParser = require("cookie-parser");
app.use(cookieParser(config.session.secret, {}));


//
//  Logger
//
const logger = require("./logger");

app.use(function(req, res, next) {
  req.logger = logger;
  next();
});


//
//  Enable Sessions
//
app.use(sessionsMiddleware);



app.get("/", function (req, res, next) {
  res.send("hello");
});



const CustomStrategy = require("passport-custom");
const Passport = require("passport").Passport;
const passport = new Passport();


//
//  This gets stored into session.passport.user
//
passport.serializeUser(function(req, user, done) {
  
  req.logger.info("serializeUser", user);
  
  if (!user.id) {
    req.logger.error({
      
    }, "user missing id");
    
    done(new Error("User missing ID"));
    return;
  }
  
  done(null, {
    id: user.id
  });
});


//
//  When pulled out from session
//
passport.deserializeUser(async function(req, user, done) {
  
  req.logger.info("deserializeUser", user);  
  
  user.message = "Added message from deserializeUser";
  
  done(null, user);
});



passport.use("first", new CustomStrategy(
  async function (req, done) {
    
    let identity = req.query.identity || "";
    
    let authInfo = {
      strategy: "first",
      client: {
        id: 123,
        name: "Example client"
      }
    };
    
    if (identity === "first") {
      done(null, {
        id: 1,
        name: "First User"
      }, authInfo);
      return;
    }
    
    //done(null, false);
    done(null, false, authInfo);
  }
));

passport.use("second", new CustomStrategy(
  async function (req, done) {
    
    let identity = req.query.identity || "";
    
    let authInfo = {
      strategy: "second",
      client: {
        id: 456,
        name: "Example client"
      }
    };
    
    if (identity === "second") {
      done(null, {
        id: 2,
        name: "Second User"
      }, authInfo);
      return;
    }
    
    //done(null, false);
    done(null, false, authInfo);
  }
));



app.get("/auth",
  passport.initialize(),
  passport.session(),

  function (req, res, next) {
    
    if (req.isAuthenticated()) {
      req.logger.info({
        user: req.user
      }, "req.user");
    }

    
    passport.authenticate(["first", "second"], { session: false }, async function (err, user, info) { 
      
      req.logger.info({
        err: err,
        user: user,
        info: info
      }, "passport.authenticate");

      
      if (err) {
        req.logger.error({
          err: err
        }, "passport.authenticate error");
        next(err);
        return;
      }
    
    
      //
      //  Turns out that info is an array if all strategies fail
      //  For successful strategy, info will be overwritten by whatever is passed to third parameter
      //
      if (!user) {
        res.json({
          msg: "No user",
          err: err,
          user: user,
          info: info,
          session: req.session
        });
        return;
      }


      //
      //  Log the user into session (serializeUser)
      //
      req.login(user, function(err) {
        if (err) {
          next(err);
          return;
        }
        
        res.json({
          msg: "Logged in",
          err: err,
          user: user,
          info: info,
          session: req.session
        });
      });
    
    }).apply(this, arguments);
  }
  
);


app.get("/info",
  passport.initialize(),
  passport.session(),
  function (req, res, next) {
    
    res.json({
      user: req.user
    });
  }
);


module.exports = app;
