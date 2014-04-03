exports.version = require(__dirname + '/../package.json').version;

var when = exports.when = require('when');
when.sequence = require('when/sequence');
when.pipeline = require('when/pipeline');
when.parallel = require('when/parallel');
when.poll = require('when/poll');
when.fn = require('when/function');
when.node = require('when/node');
when.callbacks = require('when/callbacks');
when.guard = require('when/guard');

exports.nodeify = require('nodeify');

var express = exports.express = require('./bits/express-with-patches');

exports.createRootApp = require('./bits/root-app');

exports.parsePgOptions = require('./utils/parse-pg-options');
exports.applyPgOptions = require('./utils/apply-pg-options');

var install = exports.install = require('./bits/plugins').install;
var pg = exports.pg = require('./bits/postgresql');
install(pg);

exports.abort = require('./utils/abort');
exports.init  = require('./utils/init');
exports.getConfig = require('./utils/get-config');
exports.httpError = require('./utils/http-error');
exports.consumeError = require('./utils/consume-error');
exports.randomString = require('./utils/random-string');

exports.queryToSqlParams = require('./utils/query-to-sql-params').queryToSqlParams;
exports.argsToSqlParams  = require('./utils/query-to-sql-params').argsToSqlParams;

// most likely will be removed in the future
exports.expandCb = require('./utils/expand-multi-param-callback');
exports.rescueUniqueViolation = require('./utils/unique-violation');

var context = exports.context = require('./bits/context');
exports.globalCtx = context.createContext();

// for running tests
exports.readEnv = require('./dev/read-env').readEnv;
exports.applyEnv = require('./dev/read-env').applyEnv;
