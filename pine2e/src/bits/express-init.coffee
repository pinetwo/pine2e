module.exports = (app) ->
  # use as a generic callback function
  app.emitError = emitError = (err) =>
    if err
      app.emit('error', err)

  app.invoke = (func, args=[], callback=emitError) ->
    if func.length <= args.length
      try
        result = func(args...)
      catch e
        return callback(e)
      return callback(null, result)
    else if func.length == args.length + 1
      try
        func(args..., callback)
      catch e
        callback(e)
    else
      throw new Error("Incorrect number of arguments in #{func.name or 'anonymous'}(): must be at most #{args.length+1}")

  app.init = (func) ->
    app.invoke(func)

  app.ready = (func) ->
    process.nextTick(func)

  # app._ready = no
  # app._initializing = no
  # app._initializers = no

  # app.init = (func) ->
  #   if @_ready
  #     throw new Error("Cannot call init(func) after initialization has been completed")
  #   @_initializers.push(func)

  # app.ready = (func) ->
  #   if @_ready
  #     func()
  #   else
  #     @on('ready', func)
  #     if not @_initializing
  #       @_initializing = yes
  #       # for init in @_initializers
