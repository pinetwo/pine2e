var whenHttpRequestFinished = require('../utils/http-finish');
var plugins = require('./plugins');
var when = require('when');

class Context {
  constructor() {
    plugins.call('initContext', this);
  }

  dispose() {
    return when.all(plugins.call('disposeContext', this));
  }
}

class RequestContext extends Context {
  constructor(req, res) {
    this.req = req;
    this.res = res;

    super();

    whenHttpRequestFinished(req, res, () => {
      this.dispose().done();
    });

    this.wrappedReq = Object.create(req);
    this.wrappedRes = Object.create(res);
  }
}

exports.isContext = function isContext(obj) {
  return obj instanceof Context;
};

exports.createContext = () => new Context();
exports.createRequestContext = (req, res) => new RequestContext(req, res);

exports.wrap = function wrapInContext(func) {
  return function wrappedHandler(req, res, next) {
    var result = func(req.ctx, req, res, next);
    if (when.isPromiseLike(result)) {
      when(result).done();
    }
  };
}
