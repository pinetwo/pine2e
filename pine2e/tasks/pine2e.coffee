pine2e = require('../lib/index')
shell = require('shelljs')
temp = require('temp')
fs = require('fs')

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
    grunt.fatal("HEROKU_APP or DATABASE_URL config var not defined for #{env2} in .env.#{env2}") unless vars2.HEROKU_APP or vars2.DATABASE_URL
    grunt.fatal("HEROKU_APP is the same for #{env1} and #{env2}") if vars2.HEROKU_APP and (vars1.HEROKU_APP == vars2.HEROKU_APP)

    grunt.fatal("Refusing to copy into #{env2}") if env2 == 'production'

    done = @async()

    grunt.log.writeln("Obtaining backup URL for #{vars1.HEROKU_APP}...")
    grunt.util.spawn { cmd: whichHeroku(), args: ['pgbackups:url', '--app', vars1.HEROKU_APP] }, (err, result, code) =>
      return done(err) if err

      url = result.stdout.split("\n")[0]
      grunt.fatal("Invalid URL") unless require('url').parse(url)?.protocol == 'https:'

      grunt.log.writeln("Backup URL: #{url}")

      if vars2.HEROKU_APP
        grunt.log.writeln("Restoring into #{vars2.HEROKU_APP}...")
        grunt.util.spawn { cmd: whichHeroku(), args: ['pgbackups:restore', '--app', vars2.HEROKU_APP, 'DATABASE_URL', url], opts: { stdio: 'inherit' } }, (err, result, code) =>
          return done(err) if err

          grunt.log.ok()
          done()

      else
        options2 = pine2e.parsePgOptions(vars2.DATABASE_URL)
        pine2e.applyPgOptions(options2)

        unless pg_restore = shell.which('pg_restore')
          grunt.fatal('pg_restore not found in PATH; pg_restore is required to run p2e:db:copy into a local env')
        unless curl = shell.which('curl')
          grunt.fatal('curl not found in PATH; curl is required to run p2e:db:copy into a local env')

        file = temp.path(prefix: 'pg-latest-', suffix: '.dump')
        process.on('exit', -> (fs.unlinkSync(file) if fs.existsSync(file)))

        grunt.log.writeln("Downloading into #{file} ...")

        grunt.util.spawn { cmd: curl, args: ['-o', file, url], opts: { stdio: 'inherit' } }, (err, result, code) =>
          return done(err) if err

          grunt.log.writeln("Restoring into #{options2.host}/#{options2.dbname}...")

          args = ['--verbose', '--clean', '--no-owner', '--no-acl', '-d', options2.dbname, file]

          grunt.verbose.writeln([pg_restore].concat(args).join(' '))

          grunt.util.spawn { cmd: pg_restore, args: args, opts: { stdio: 'inherit' } }, (err, result, code) =>
            return done(err) if err
            grunt.log.ok()
            done()
          # done()


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


  grunt.registerTask "p2e:heroku", "Run an arbitrary Heroku command for the given env (e.g. p2e:heroku:production:ps)", (env, cmdparts...) ->
    grunt.fatal("Missing env name in #{@nameArgs}, use e.g. #{@nameArgs}:production:ps") unless env
    grunt.fatal("Missing the command to run, use e.g. #{@nameArgs}:production:ps") unless cmdparts.length > 0

    vars = pine2e.readEnv(env)
    grunt.fatal("HEROKU_APP config var not defined for #{env} in .env.#{env}") unless vars.HEROKU_APP

    done = @async()

    args = [cmdparts.join(':'), '--app', vars.HEROKU_APP]
    grunt.log.writeln("heroku #{args.join(' ')}")

    grunt.util.spawn { cmd: whichHeroku(), args: args, opts: { stdio: 'inherit' } }, (err, result, code) =>
      done(err)
