pine2e = require('../lib/index')
shell = require('shelljs')

module.exports = (grunt) ->

  requireEnvArg = (t, env) ->
    grunt.fatal("Missing env name in #{t.nameArgs}, use e.g. #{t.nameArgs}:production") unless env


  whichGit = -> (shell.which('git') or grunt.fatal('git not found in PATH'))


  findGitRemotes = (callback) ->
    # alt: args = ['for-each-ref', '--format', '%(refname)', 'refs/remotes/*/*']
    #      list = result.stdout.split("\n").map((ln) -> if M = ln.match(///^ refs / remotes / ([^/])+ / ([^/])+ $/// then M[1] else null)).filter((ln) -> !!ln)
    grunt.util.spawn { cmd: whichGit(), args: ['remote'] }, (err, result, code) =>
      if err
        callback(err)
      else
        list = result.stdout.split("\n").filter((ln) -> !!ln)
        callback(null, list)


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


  grunt.registerTask "p2e:deploy", "Deploy Pine2e app", (env) ->
    requireEnvArg(this, env)
    pine2e.readEnv(env)  # for error messages

    done = @async()
    findGitRemotes (err, remotes) =>
      return grunt.fatal(err) if err

      names = [env, "heroku-#{env}"]
      for name in names
        if name in remotes
          remote = env

      unless remote
        grunt.fatal("Cannot find a Git remote for env #{env}; none of acceptable choices #{JSON.stringify names} found among #{JSON.stringify remotes}")

      # TODO: delay

      # echo Deploying to STAGING...
      # sleep 3

      # say="say -r250 -v Serena"
      # seconds=3
      # echo $seconds...
      # $say "Caution: commencing production deployment in $seconds..."
      # seconds=$(expr $seconds - 1)
      # while test $seconds -gt 0; do
      #     sleep 0.5
      #     echo $seconds...
      #     $say "$seconds..."
      #     seconds=$(expr $seconds - 1)
      # done
      # sleep 0.5

      args = ['push', remote, 'HEAD:master']
      grunt.log.writeln(['git'].concat(args).join(' '))

      grunt.util.spawn { cmd: whichGit(), args: args, opts: { stdio: 'inherit' } }, (err, result, code) =>
        return grunt.fatal(err) if err

        grunt.log.ok()
        done()
