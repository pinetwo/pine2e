var debug = require('debug')('sql');
var {inspect} = require('util');

module.exports = function patchPostgres(pg) {
  if (!debug.enabled)
    return;

  var origQuery = pg.Client.prototype.query;
  pg.Client.prototype.query = patchedQuery;

  function patchedQuery(config, values, callback) {
    var sql;
    if (typeof config === 'string')
      sql = config;
    else if ((typeof config === 'object') && config != null && 'text' in config)
      sql = config.text;

    var params = [];
    if (Array.isArray(values))
      params = values;

    if (sql) {
      if (params.length === 0)
        debug(sql);
      else
        debug(sql + "  " + inspect(params, {colors: true}));
    }

    return origQuery.apply(this, arguments);
  }
};
