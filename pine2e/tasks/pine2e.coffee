pine2e = require('../lib/index')
shell = require('shelljs')

module.exports = (grunt) ->

  requireEnvArg = (t, env) ->
    grunt.fatal("Missing env name in #{t.nameArgs}, use e.g. #{t.nameArgs}:production") unless env


  whichGit = -> (shell.which('git') or grunt.fatal('git not found in PATH'))

  whichHeroku = -> (shell.which('heroku') or grunt.fatal('heroku binary not found in PATH'))


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

    done = @async()

    grunt.log.writeln("Dumping #{options.host}/#{options.dbname}...")
    grunt.util.spawn { cmd: pg_dump, args: ['--schema-only', '--no-owner', '--no-acl', '--no-security-labels', '--no-tablespaces'] }, (err, result, code) =>
      return done(err) if err

      result = result.stdout
        .split("\n")
        .filter((ln) -> !ln.match(/^(--|SET|CREATE EXTENSION|COMMENT ON|ALTER .* OWNED BY)/))
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
      grunt.file.write('schema.sql', result)
      grunt.log.ok()

      done()


  grunt.registerTask "p2e:db:copy", "Copy database from env1 to env2 (e.g. p2e:db:copy:production:staging)", (env1, env2) ->
    grunt.fatal("Missing env name in #{@nameArgs}, use e.g. #{@nameArgs}:production:staging") unless env1 and env2
    grunt.fatal("env1 == env2") if env1 == env2

    vars1 = pine2e.readEnv(env1)
    vars2 = pine2e.readEnv(env2)
    grunt.fatal("HEROKU_APP config var not defined for #{env1} in .env.#{env1}") unless vars1.HEROKU_APP
    grunt.fatal("HEROKU_APP config var not defined for #{env2} in .env.#{env2}") unless vars2.HEROKU_APP
    grunt.fatal("HEROKU_APP is the same for #{env1} and #{env2}") if vars1.HEROKU_APP == vars2.HEROKU_APP

    grunt.fatal("Refusing to copy into #{env2}") if env2 == 'production'

    done = @async()

    grunt.log.writeln("Obtaining backup URL for #{vars1.HEROKU_APP}...")
    grunt.util.spawn { cmd: whichHeroku(), args: ['pgbackups:url', '--app', vars1.HEROKU_APP] }, (err, result, code) =>
      return done(err) if err

      url = result.stdout.split("\n")[0]
      grunt.fatal("Invalid URL") unless require('url').parse(url)?.protocol == 'https:'

      grunt.log.writeln("Backup URL: #{url}")

      grunt.log.writeln("Restoring into #{vars2.HEROKU_APP}...")
      grunt.util.spawn { cmd: whichHeroku(), args: ['pgbackups:restore', '--app', vars2.HEROKU_APP, 'DATABASE_URL', url], opts: { stdio: 'inherit' } }, (err, result, code) =>
        return done(err) if err

        grunt.log.ok()
        done()


  grunt.registerTask "p2e:deploy", "Deploy Pine2e app", (env) ->
    requireEnvArg(this, env)
    vars = pine2e.readEnv(env)

    done = @async()
    findGitRemotes (err, remotes) =>
      return grunt.fatal(err) if err

      remote = vars.GIT_REMOTE or env

      unless remote in remotes
        grunt.fatal("Cannot find Git remote #{JSON.stringify remote} for env #{JSON.stringify env}; available remotes are #{JSON.stringify remotes}")

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
