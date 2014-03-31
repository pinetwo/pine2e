exports.version = require(__dirname + '/../package.json').version

exports.express = express = require('./bits/express-with-patches')


Path = require('path')

exports.createRootApp = createRootApp = (libDir) ->
  app = express()

  require('./bits/express-init')(app)
  # require('./bits/express-resources')(app)
  require('./bits/express-dirs')(app)

  app.dirs.root = Path.dirname(libDir)
  app.dirs.lib = libDir
  app.dirs.assets = app.subdir('root', 'assets')
  app.dirs.views = app.subdir('root', 'views')

  app.set('views', app.dirs.views)

  return app

exports.createRootApp = createRootApp

exports.parsePgOptions = require('./utils/parse-pg-options')
# for running tests
exports.readEnv = require('./dev/read-env').readEnv
exports.applyEnv = require('./dev/read-env').applyEnv
