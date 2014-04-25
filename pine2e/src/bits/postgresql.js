var when = require('when');
var nodefn = require('when/node');
var prenodeify = require('../utils/prenodeify');
var getConfig = require('../utils/get-config');
var {argsToSqlParams} = require('../utils/query-to-sql-params');


////////////////////////////////////////////////////////////////////////////////////////////////////
// exports

exports.name = 'postgresql';

exports.initContext = initContext;
exports.disposeContext = disposeContext;

exports.query = prenodeify(query);
exports.queryRow = query.row = prenodeify(queryRow);
exports.queryValue = query.value = prenodeify(queryValue);

exports.beginTx = beginTx;
exports.commitTx = commitTx;
exports.rollbackTx = rollbackTx;

exports.withTx = withTx;
exports.requiresTx = requiresTx;
exports.requestRequiresTx = requestRequiresTx;

exports.listen = listen;

exports.connect = connect;
exports.connectCustom = connectCustom;


////////////////////////////////////////////////////////////////////////////////////////////////////
// basic PostgreSQL configuration and operations

// pg + patch
var pg = exports.pg = require('pg');
configurePg(pg);

var dbConnectionString;

var pgConnectRaw = nodefn.lift(pg.connect.bind(pg));

var execute = when.lift(function executeInternal(client, sql, params=[]) {
  var query = nodefn.lift(client.query);
  return query.call(client, sql, params);
});

function configurePg(pg) {
  require('./postgresql-logging')(pg);  // use DEBUG=sql to dump all SQL statements

  // treat TIMESTAMP WITHOUT TIME ZONE values as UTC dates, and return moment.js objects
  var moment = require('moment')
  pg.types.setTypeParser(1114, (stringValue) => moment.utc(stringValue));
}

function connect() {
  if (!dbConnectionString) {
    dbConnectionString = getConfig('DATABASE_URL');
  }
  return pgConnectRaw(dbConnectionString);
}

function connectCustom(dbConnectionString) {
  return pgConnectRaw(dbConnectionString);
}


////////////////////////////////////////////////////////////////////////////////////////////////////
// plugin hooks

function initContext(ctx) {
  ctx.pgTx = false;
  ctx.pgClientRefs = 0;
  ctx.pgClient = null; // a promise for [client, done]
}

function disposeContext(ctx) {
  return finishTransaction(ctx, true);
}


////////////////////////////////////////////////////////////////////////////////////////////////////
// transaction and connection management

function isInsideTx(ctx) {
  return !!ctx.pgTx;
}

function allocatePgConnection(ctx) {
  ++ctx.pgClientRefs;

  if (!ctx.pgClient) {
    ctx.pgClient = connect();
  }

  return ctx.pgClient;
}

function freePgConnection(ctx) {
  if (ctx.pgClientRefs === 0)
    throw new Error("freePgConnection without a matching allocatePgConnection");
  if (--ctx.pgClientRefs === 0) {
    var client = ctx.pgClient;
    ctx.pgClient = null;
    return client.spread((client, done) => done());
  } else {
    return when(null);
  }
}

function beginTx(ctx) {
  if (ctx.isLongLived) {
    throw new Error("Refusing to start a PostgreSQL transaction in a long-lived context");
  }
  if (!ctx.pgTx) {
    ctx.pgTx = true;
    return allocatePgConnection(ctx).spread((client) => execute(client, "BEGIN"));
  } else {
    return when(null);
  }
}

function commitTx(ctx) {
  return finishTransaction(ctx, true);
}

function rollbackTx(ctx) {
  return finishTransaction(ctx, false);
}

function finishTransaction(ctx, commit) {
  if (ctx.pgTx) {
    ctx.pgTx = false;
    var command = (commit ? "COMMIT" : "ROLLBACK");
    return ctx.pgClient.spread((client, done) => execute(client, command)).finally(() => freePgConnection(ctx));
  } else {
    return when();
  }
}

function resolveParamsAndExecute(client, sql, params=[]) {
  return when.all(params).then((resolvedParams) => execute(client, sql, resolvedParams));
}

function queryRaw(ctx, sql, params) {
  if (ctx.pgClient)
    return ctx.pgClient.spread((client) => resolveParamsAndExecute(client, sql, params));
  else
    return connect().spread((client, done) => resolveParamsAndExecute(client, sql, params).finally(done));
}


////////////////////////////////////////////////////////////////////////////////////////////////////
// query helpers

function query(ctx, ...args) {
  var {sql, params} = argsToSqlParams(args);
  return queryRaw(ctx, sql, params).then(extractRowsIfAvailable);
}

function queryRow(...args) {
  return query(...args).then(rows => (rows.length ? rows[0] : null));
}

function queryValue(...args) {
  return queryRow(...args).then(extractSingleValue);
}

function extractRowsIfAvailable(result) {
  if (result.rows != null)
    return result.rows;
  else
    return result;
}

function extractSingleValue(row) {
  if (!row)
    return null;
  else {
    var keys = Object.keys(row);
    if (keys.length == 1)
      return row[keys[0]];
    else
      return when.reject(new Error("queryValue result row has multiple keys: " + JSON.stringify(keys)));
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////
// transaction helpers

function withTx(ctx, body, ...args) {
  if (isInsideTx(ctx)) {
    return body.apply(this, args);
  } else {
    return beginTx(ctx).then(() => body()).catch(() => rollbackTx(ctx)).tap(() => commitTx(ctx));
  }
}

function requiresTx(func) {
  return function(ctx) {
    if (isInsideTx(ctx)) {
      return func.apply(this, arguments);
    } else {
      return beginTx(ctx).then(() => func.apply(this, arguments)).catch(() => rollbackTx(ctx)).tap(() => commitTx(ctx));
    }
  }
}

function requestRequiresTx(req, res, next) {
  var ctx = req.ctx;
  if (!ctx) {
    return next();
  }

  if (isInsideTx(ctx)) {
    next();
  } else {
    // the transaction will end when the request ends
    beginTx(ctx).catch(next).then(() => next());
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////
// pub/sub

// no way to stop listening currently
function listen(ctx, channel, func) {
  allocatePgConnection(ctx).done();
  query(ctx, "LISTEN " + channel).done();
  ctx.pgClient.spread((client, done) => {
    client.on('notification', (msg) => {
      console.log(msg);
      func(msg.payload);
    });
  });
}
