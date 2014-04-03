module.exports = function extractCallback(args) {
  if (typeof(args[args.length - 1]) === 'function')
    return args.pop();
  else
    return null;
};
