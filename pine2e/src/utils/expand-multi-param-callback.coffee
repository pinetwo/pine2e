module.exports = (func) ->
  return (args...) ->
    cb = args.pop()
    args.push (err, results) -> cb.apply(null, [err].concat(results))
    func.apply(this, args)
