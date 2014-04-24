module.exports = exports = require('./index-generic')

// express & root app

var express = exports.express = require('./bits/express-with-patches');

exports.rootApp = null;
exports.initializeRootApp = function() {
  var rootApp = require('./bits/app').initializeRootApp.apply(null, arguments);
  exports.rootApp = rootApp;
  return rootApp;
};
exports.createSubapp = require('./bits/app').createSubapp;


// plugins
var install = exports.install = require('./bits/plugins').install;

// pg
var pg = exports.pg = require('./bits/postgresql');
install(pg);

// context
var context = exports.context = require('./bits/context');
exports.globalCtx = context.globalCtx;
exports.wrap = context.wrap;
