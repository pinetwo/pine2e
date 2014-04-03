var whenHttpRequestFinished = require('../utils/http-finish');
var plugins = require('./plugins');

class Context {
  constructor() {
    plugins.call('initContext', this);
  }

  dispose() {
    plugins.call('disposeContext', this);
  }
}

class RequestContext extends Context {
  constructor(req, res) {
    this.req = req;
    this.res = res;
    super();

    whenHttpRequestFinished(req, res, this.dispose.bind(this));
  }
}

exports.isContext = function isContext(obj) {
  return obj instanceof Context;
};

exports.createContext = () => new Context();
exports.createRequestContext = (req, res) => new RequestContext(req, res);
