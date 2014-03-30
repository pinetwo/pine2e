originalExpress = require('express')
patchExpress = require('streamline-express')

module.exports = express = -> patchExpress(originalExpress())

for k, v of originalExpress
  express[k] = v
