module.exports = rescueUniqueViolation = (cb, func, fallback) ->
  func (err, result) ->
    if err
      if err.code is '23505'  # duplicate key value violates unique constraint
        if typeof fallback is 'function'
          return fallback(cb)
        else
          return cb(null, fallback)
      else
        return cb(err)
    else
      return cb(null, result)
