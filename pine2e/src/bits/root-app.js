var Path = require('path');
var express = require('./express-with-patches');
var context = require('./context');

module.exports = createRootApp;

function createRootApp(libDir) {
  var app = express();

  require('./express-init')(app);
  require('./express-dirs')(app);

  app.dirs.root = Path.dirname(libDir);
  app.dirs.lib = libDir;
  app.dirs.assets = app.subdir('root', 'assets');
  app.dirs.views = app.subdir('root', 'views');

  app.set('views', app.dirs.views);

  app.use((req, res, next) => {
    var ctx = req.ctx = res.ctx = context.createRequestContext(req, res);
    next();
  });

  app.use(require('express-promise')());

  return app;
}
