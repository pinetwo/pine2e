module.exports = abort = (err, message) ->
  if message and err
    console.error "⤫ #{message} #{err.stack or err.message or err}"
  else if err
    console.error "⤫ #{err.stack or err.message or err}"
  else if messag
    console.error "⤫ #{message}"
  else
    console.error "⤫ Unknown fatal error"
  process.exit(1)
