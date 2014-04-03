module.exports = prenodeify;

var nodeify = require('nodeify');

function prenodeify(f) {
  return function(...args) {
    if (args.length > 0 && typeof(args[args.length - 1]) === 'function') {
      var callback = args.pop();
      var promise = f.apply(this, args);
      nodeify(promise, callback);
    } else {
      return f.apply(this, arguments);
    }
  }
}
