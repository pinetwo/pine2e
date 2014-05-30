var assert = require('assert');
var p2e = require("../" + (process.env.JSLIB || 'lib') + "/index-generic");
var express = p2e.express;
var test = p2e.test;

describe("pine2e.test", () => {
  it("should woot", (done) => {
    var app = express();
    app.get('/ultimate-question', (req, res) => {
      res.send({ answer: 42 });
    });
    app.foo();
    done();
  });
});
