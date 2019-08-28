/**
 * Project Main File
 *
 * This file will load an ExpressJS app on a specified port
 */
"use strict";

const http = require("http");



//
//  Config
//
const config = {
  port: 8080,
  app: {
    timeout: 30000
  }
};

const port = config.port;

const logger = require("./lib/logger");


process.on("warning", function (err){
  console.log(" => process warning => ", err.stack || err);
  logger.warn({
    err: err
  }, "process warning");
});


//  Load ExpressJS App
const app = require("./lib/app");



//
//  Create the HTTP Server
//
const server = http.createServer(app);

//  Set timeout
server.setTimeout(config.app.timeout || 30000);


//
//  Set error handler
//
server.on("error", function (err) {
  //  Log the error
  logger.error({
    err: err
  }, "App failed to listen on port: %s", port);
});


//
//  Listen / Start App
//
server.listen(port, function () {
  //  Log the listening port
  logger.info({
    "event": "app-load-success",
    "node_env": process.env.NODE_ENV,
    "node_version": process.version,
    "port": port
  }, "App listening on port: %s", port);
});


module.exports = server;