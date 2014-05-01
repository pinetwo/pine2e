originalExpress = require('express')
patchExpress = require('streamline-express')

require('express-namespace');
require('express-resource');

module.exports = express = -> patchExpress(originalExpress())

for k, v of originalExpress
  express[k] = v
