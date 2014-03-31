fs = require('fs')

readFile = (name, data) ->
  if fs.existsSync(name)
    lines = fs.readFileSync(name, 'utf8').split("\n")
    for line in lines
      if M = line.match ///^ \s* (\S+) \s* = (.*) $///
        data[M[1].trim()] = M[2].trim()
    return data
  else if fs.existsSync(name + '.sample')
    throw new Error("Please copy #{name}.sample to #{name} and customize as needed")
  else
    return null

exports.readEnv = readEnv = (env) ->
  data = {}
  readFile(".env", data)
  readFile(".env.#{env}", data)
  return data

exports.applyEnv = (env) ->
  if data = readEnv(env)
    for own k, v of data
      process.env[k] = v
  else
    throw new Error("Environment #{env} not found, please create .env.#{env}")
