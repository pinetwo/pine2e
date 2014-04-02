abort = require('./abort')
debug = require('debug')('p2e:init')

module.exports = init = (func) ->
  func (err, message) ->
    # don't log bogus return values when using CoffeeScript + Streamline.js
    if typeof(message) != 'string'
      message = null

    if err
      abort(err, (message or "Initialization failed"))
    else if message
      debug "✔︎ #{message}"
