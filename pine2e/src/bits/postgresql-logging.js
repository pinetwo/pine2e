var debug = require('debug')('pg:sql');

module.exports = function patchPostgres(pg) {
  var origQuery = pg.Client.prototype.query;
  pg.Client.prototype.query = patchedQuery;

  function patchedQuery(config, values, callback) {
    var sql;
    if (typeof config === 'string')
      sql = config;
    else if ((typeof config === 'object') && config != null && 'text' in config)
      sql = config.text;

    if (sql)
      debug(sql);

    return origQuery.apply(this, arguments);
  }
};
