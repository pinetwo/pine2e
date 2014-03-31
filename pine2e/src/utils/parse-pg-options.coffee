Url = require('url')

module.exports = parsePgOptions = (options) ->
  if typeof options is 'string'
    O = Url.parse(options)
    [xxx, dbname] = O.pathname.split('/')
    [username, password] = O.auth.split(':')

    return {
      dialect: O.protocol.replace(/:/g, '')
      host: O.hostname
      port: O.port
      user: username
      pass: password
      dbname: dbname
    }

  else
    throw new Error("Unsupported type of PG options: " + options)
