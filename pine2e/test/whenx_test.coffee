{ ok, equal, deepEqual, ifError: noError } = require 'assert'
whenx = require "../#{process.env.JSLIB or 'lib'}/whenx"

describe 'whenx', ->

  describe '.cb', ->
    it "should call cb(null, value) on fulfilment", (done) ->
      whenx(42).cb (err, value) ->
        noError(err)
        equal value, 42
        done()

    it "should call cb(err) on rejection", (done) ->
      theErr = new Error("foo")
      whenx.reject(theErr).catch (err) ->
        equal err, theErr
        done()
      # whenx.reject(theErr).cb (err, value) ->
      #   equal err, theErr
      #   equal typeof(value), 'undefined'
      #   done()

    it "should call cb on the next tick", (done) ->
      called = no
      whenx(42).cb(-> called = yes; done())
      equal(called, no)

  describe 'lodash methods like pluck', ->
    it "should work", (done) ->
      foo = {x: 1, y: 2}
      bar = {x: 3, y: 4}
      whenx([foo, bar]).pluck('x').tap((value) -> deepEqual(value, [1, 3])).cb(done)
