var extractCallback = require('./extract-callback');

exports.queryToSqlParams = queryToSqlParams;
exports.argsToSqlParams  = argsToSqlParams;

function queryToSqlParams(query) {
  if (typeof query === 'string') {
    return { sql: query, params: [] };

  } else if (Array.isArray(query)) {
    return { sql: query[0], params: query.slice(1) };

  } else if (typeof query.toQuery === 'function') {
    // node-sql
    query = query.toQuery();
    return { sql: query.text, params: query.values };

  } else if (typeof query.toParam === 'function') {
    // squel
    query = query.toParam();
    return { sql: query.text, params: query.values };

  } else if (query.sql != null) {
    // mohair
    return { sql: query.sql, params: query.params || [] };

  } else {
    throw new Error('Unsupported type of query: ' + query)
  }
}

function argsToSqlParams(args) {
  if (args.length === 0) {
    throw new Error('Missing query');
  }

  var callback = extractCallback(args);

  if (typeof args[0] === 'string') {
    var query = args.shift();
    return { sql: query, params: args };
  }

  if (args.length !== 1) {
    throw new Error('Too many arguments');
  }

  var result = queryToSqlParams(args[0]);
  if (callback)
    result.callback = callback;
  return result;
}
