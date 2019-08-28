"use strict";


const session = require("express-session");
//const mysqlSession = require("express-mysql-session");


module.exports = sessionsMiddleware;


let sessions = {
  secure: null,
  unsecure: null
}

let sessionStore;



// potential memory leak (MaxListenersExceededWarning)
function sessionsMiddleware(req, res, next) {
  const config = req.app.get("config");

  //
  //  Create Session Store
  //
  if (!sessionStore) {
    //  Set the interval that will clear expired sessions (in milliseconds)
    let checkExpirationInterval = 900000;
    
    //
    //  Staggered Clearing of Expired Sessions
    //  We randomly calculate an offset so this process will not clear expired
    //  sessions at the same time as the other processes
    //  Add a random duration of between 1 and 2 hours
    //
    let offset = Math.floor(Math.random() * 3600000);
    checkExpirationInterval += offset;


    /*
    //
    //  MySQL Store
    //
    const mysqlConfig = config.mysql.authrw.connection;
    const MySQLStore = mysqlSession(session);
    sessionStore = new MySQLStore({
      host: mysqlConfig.host,
      user: mysqlConfig.user,
      password: mysqlConfig.password,
      database: mysqlConfig.database,
      expiration: config.session.maxAge,
      checkExpirationInterval: checkExpirationInterval,
      createDatabaseTable: false,
      schema: {
        tableName: "session",
      }
    });
    //*/


    //*
    //
    //  Memory Store
    //
    const MemoryStore = require("memorystore")(session);
    const sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    //*/
  }
  
  
  
  const secret = config.session.secret;
  const useSecure = (req.protocol === "https") ? true : false;
  const secureType = (req.protocol === "https") ? "secure" : "unsecure";
  
  if (!sessions[secureType]) {
    sessions[secureType] = session({
      store: sessionStore,
      name: config.session.key || "authorization.sid",
      secret: secret,
      resave: false,
      unset: "destroy", // keep, destroy
      saveUninitialized: false,
      cookie: {
        secure: useSecure,
        maxAge: config.session.maxAge
      }
    });
  }
  
  sessions[secureType].apply(this, arguments);
};

