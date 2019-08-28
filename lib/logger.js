"use strict";

const bunyan = require("bunyan");


//
//  Logger
//
let opts = {
  name: "App"
};

if (process.env.NODE_ENV === 'development') {
  opts.src = true;
  opts.level = "trace";
}

const logger = bunyan(opts);



module.exports = logger;