module.exports = getConfig = (varName) ->
  value = process.env[varName]
  unless value
    throw new Error("Environment variable not set: #{varName}")
  return value
