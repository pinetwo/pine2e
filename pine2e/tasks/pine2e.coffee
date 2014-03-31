pine2e = require('../lib/index')
shell = require('shelljs')

module.exports = (grunt) ->

  grunt.registerTask "p2e:schema:dump", "Dump the dev environment's schema into schema.sql", (env) ->
    vars = pine2e.readEnv('dev')
    options = pine2e.parsePgOptions(vars.DATABASE_URL)
    pine2e.applyPgOptions(options)

    unless pg_dump = shell.which('pg_dump')
      grunt.fatal('pg_dump not found in PATH; pg_dump is required to run p2e:dump-schema')

    grunt.log.writeln("Dumping #{options.host}/#{options.dbname}...")

    callback = @async()
    grunt.util.spawn { cmd: pg_dump, args: ['--schema-only', '--no-owner', '--no-acl', '--no-security-labels', '--no-tablespaces'] }, (err, result, code) =>
      if err
        grunt.fatal(err)
      else
        result = result.stdout
          .split("\n")
          .filter((ln) -> !ln.match(/^(--|SET|CREATE EXTENSION|COMMENT ON|ALTER .* OWNED BY)/))
          .join("\n")
          .replace(/\n{3,}/g, "\n\n")
          .trim()
        grunt.file.write('schema.sql', result)
        grunt.log.ok()
