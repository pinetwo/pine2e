{ ok, equal, deepEqual } = require 'assert'
{ woot } = require "../#{process.env.JSLIB or 'lib'}/index"

describe 'pine2e-file-uploads-pg', ->

  it "should woot", ->
      equal woot(), 42
