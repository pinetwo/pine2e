var Path = require('path');
var fs = require('fs');
var express = require('./express-with-patches');
var context = require('./context');
var flash = require('express-flash')


var rootApp = exports.rootApp = null;
exports.initializeRootApp = initializeRootApp;
exports.createSubapp = createSubapp;


function initializeRootApp(rootDir, libDir) {
  var app = rootApp = exports.rootApp = express();
  require('./express-init')(app);
  require('./express-dirs')(app);

  app.dirs.root = rootDir;
  app.dirs.lib = app.subdir('root', 'lib');
  app.dirs.assets = app.subdir('root', 'assets');
  app.dirs.views = app.subdir('root', 'views');
  app.dirs.bower = app.subdir('root', 'bower_components');

  app.configModule = require(app.subdir('lib', 'config'));
  app.getConfig = app_getConfig.bind(app);
  app.callHook = app_callHook.bind(app);

  app.startServer = startServer.bind(null, app);

  configureApp(app);
  configureRootApp(app);

  app.callHook('configureApp');
  app.callHook('configureRootApp');

  return app;
}


function createSubapp() {
  var subapp = express();

  subapp.dirs = rootApp.dirs;
  subapp.getConfig = rootApp.getConfig;
  subapp.callHook = rootApp.callHook;

  configureApp(subapp);
  subapp.callHook('configureApp');

  return subapp;
}


function configureApp(app) {
  var env = process.env.NODE_ENV || 'development';

  // views
  app.set('views', app.dirs.views);
  app.set('view engine', 'jade');
  if (env === 'development') {
    app.locals.pretty = true;  // for Jade
  }
}


function configureRootApp(app) {
  var env = process.env.NODE_ENV || 'development';

  // port
  app.set('port', process.env.PORT || 5000);

  // gzip
  app.use(express.compress());

  // favicon
  var favIconPath = app.subdir('assets', 'favicon.ico');
  var favIconExists = fs.existsSync(favIconPath);
  app.use(express.favicon(favIconExists ? favIconPath : undefined));

  // logging
  if (env === 'development') {
    app.use(express.logger('dev'));
    app.use(express.errorHandler())
  } else if (env === 'test') {
    // don't log
    app.use(express.errorHandler())
  } else if (process.env.LOG_REQUESTS) {
    // Heroku already logs requests, so this is off by default
    app.use(express.logger());
  }

  // static assets
  app.use('/assets', express.static(app.subdir('assets')));
  if (fs.existsSync(app.subdir('bower'))) {
    app.use('/bower_components', express.static(app.subdir('bower')));
  }

  // request parsers
  app.use(express.cookieParser());
  app.use(express.urlencoded())
  app.use(express.json())

  app.use(express.cookieParser(app.getConfig('SESSION_SECRET')));
  app.use(express.cookieSession({secret: app.getConfig('SESSION_SECRET')}));
  app.use(flash())

  // TODO: figure this out
  // app.use(express.csrf());
  // ... res.locals.token = req.csrfToken();

  // context & promises
  app.use(addRequestContext);
  app.use(require('express-promise')());

  require(app.subdir('lib', 'routes'))(app)
}


function startServer(app) {
  var server = require('http').createServer(app);
  app.server = server;

  var port = app.get('port');

  process.on('uncaughtException', (err) => {
    console.error("Unhandled exception - %s", err.stack || err.message || err)
    process.exit(1)
  });

  server.on('listening', () => {
    console.log("✔ Express server listening on port %d in %s mode", port, app.settings.env);
  });

  server.listen(port);
}


function addRequestContext(req, res, next) {
  req.ctx = res.ctx = context.createRequestContext(req, res);
  next();
}


function app_getConfig(varName, defaultValue) {
  var value;

  if (this.configModule[varName]) {
    value = this.configModule[varName];
    if (typeof(value) === 'function') {
      value = value.call(null, this);
    }
    return value;
  }

  value = process.env[varName];
  if (value == null) {
    if (typeof(defaultValue) === 'undefined') {
      throw new Error("Environment variable or config.js variable not set: " + varName);
    } else {
      value = defaultValue;
    }
  }
  return value;
}

function app_callHook(varName, ...args) {
  if (this.configModule[varName]) {
    var value = this.configModule[varName];
    if (typeof(value) === 'function') {
      value = value.call(null, this, ...args);
    }
    return value;
  }
}
