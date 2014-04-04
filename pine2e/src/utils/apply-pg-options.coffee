module.exports = (options) ->
  process.env.PGUSER     = options.user
  process.env.PGPASSWORD = options.pass
  process.env.PGHOST     = options.host
  process.env.PGPORT     = options.port or 5432
  process.env.PGDATABASE = options.dbname

  if (options.ssl == null) || (options.ssl == true)
    process.env.PGSSLMODE = 'require'
