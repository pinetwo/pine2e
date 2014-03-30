Path = require('path')

module.exports = (app) ->
  app.dirs = {}

  app.subdir = (dirName, subdirs...) ->
    unless dir = this.dirs[dirName]
      throw new Error("app.subdir(): invalid dir name #{JSON.stringify dirName}")

    if subdirs.length == 0
      return dir
    else
      return Path.join(dir, subdirs...)
