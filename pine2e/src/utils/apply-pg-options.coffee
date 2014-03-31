module.exports = (options) ->
  process.env.PGUSER     = options.user
  process.env.PGPASSWORD = options.pass
  process.env.PGHOST     = options.host
  process.env.PGPORT     = options.port or 5432
  process.env.PGDATABASE = options.dbname
  process.env.PGSSLMODE  = 'require'
