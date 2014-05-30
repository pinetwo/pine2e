exports.version = require(__dirname + '/../package.json').version;

exports.when = require('./whenx');

exports.nodeify = require('nodeify');

exports.express = require('./bits/express-with-patches');

exports.parsePgOptions = require('./utils/parse-pg-options');
exports.applyPgOptions = require('./utils/apply-pg-options');

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

// for running tests
exports.readEnv = require('./dev/read-env').readEnv;
exports.applyEnv = require('./dev/read-env').applyEnv;

exports.test = require('supertest');
