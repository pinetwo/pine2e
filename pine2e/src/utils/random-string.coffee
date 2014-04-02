Digits = '0123456789'
DefaultChars = Digits + 'ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'

randomString = (length=32, chars=DefaultChars) ->
  chosen = []
  while chosen.length < length
    chosen.push chars[Math.floor(Math.random() * chars.length)]

  return chosen.join('')

randomString.Digits = Digits

module.exports = randomString
