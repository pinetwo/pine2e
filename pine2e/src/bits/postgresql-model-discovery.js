var Model = require('./postgresql-model');
var W = require('../whenx');
var pg = require('./postgresql');
var _ = require('lodash');
var sql = require('sql');

module.exports = discover;

function discover(ctx) {
  return pg.query(ctx, "SELECT t.table_name tableName, c.column_name columnName, c.data_type dataType FROM information_schema.tables t INNER JOIN information_schema.columns c USING (table_schema, table_name) WHERE t.table_schema = 'public'").then((allColumns) => {
    var tables = _.groupBy(allColumns, 'tableName')
    console.log('tables = %s', JSON.stringify(tables, null, 2));
  });
}

// exports.authTokens = sql.define({
//   name: 'auth_tokens'
//   columns: [
//     { name: 'token', property: 'token' }
//     { name: 'resident_id', property: 'residentId' }
//     { name: 'creation_time', property: 'creationTime' }
//     { name: 'concierge_id', property: 'conciergeId' }
//   ]
// })
