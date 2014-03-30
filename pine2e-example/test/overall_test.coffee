{ ok, equal, deepEqual } = require 'assert'
{ woot } = require "../#{process.env.JSLIB or 'lib'}/index"

describe 'pine2e-example', ->

  it "should woot", ->
      equal woot(), 42
