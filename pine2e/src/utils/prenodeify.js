module.exports = prenodeify;

var when = require('when');
var nodeify = require('nodeify');

function prenodeify(f) {
  var lifted = when.lift(f);

  return function(...args) {
    if (args.length > 0 && typeof(args[args.length - 1]) === 'function') {
      var callback = args.pop();
      var promise = f.apply(this, args);
      nodeify(promise, callback);
    } else {
      return lifted.apply(this, arguments);
    }
  }
}
