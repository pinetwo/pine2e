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

exports.createRootApp = createRootApp;

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

exports.context = require('./bits/context');

// for running tests
exports.readEnv = require('./dev/read-env').readEnv;
exports.applyEnv = require('./dev/read-env').applyEnv;


var Path = require('path');

function createRootApp(libDir) {
  var app = express();

  require('./bits/express-init')(app);
  require('./bits/express-dirs')(app);

  app.dirs.root = Path.dirname(libDir);
  app.dirs.lib = libDir;
  app.dirs.assets = app.subdir('root', 'assets');
  app.dirs.views = app.subdir('root', 'views');

  app.set('views', app.dirs.views);

  return app;
}
