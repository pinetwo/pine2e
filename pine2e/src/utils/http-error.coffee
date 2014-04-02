module.exports = httpError = (status, code, message) ->
  e = new Error(message)
  e.status = status
  e.code = code
  return e
