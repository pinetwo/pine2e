# pine2e

Pinetwo's pluggable web stack based on Express.js and PostgreSQL. Runs on Heroku (and similar environments).

Under development. Normally, parts of the stack are developed elsewhere and then extracted from production apps.


## Configuration and environments

Pine2e apps follow [Heroku's twelve-factor apps methodology](http://12factor.net). In particular, the app's configuration is loaded from environment variables like `PORT` and `DATABASE_URL`. (Unlike, say, Rails, which loads its configuration from YAML files like `config/database.yml`.)

Normally, you set up a `Procfile` and use the Foreman gem to run the app. Foreman loads the environment variables from a file called `.env`, although the file name can be provided from the command line.

Pine2e embraces the notion of `.env` file, extending the idea to multiple _environments_ (configurations) of the app. You can use any environment names you want, but the following four are special and conventional:

* `dev`, for running the app during development
* `test`, to use when running tests (its database gets be wiped out by each test run)
* `staging`
* `production` (Pine2e will take extra care when deploying to production, and will refuse to perform destructive actions with production database)

(Any other environment names you might use are treated exactly like `staging`.)

The configuration for the dev environment is stored in `.env` (so that it's the default one used by Foreman), and other environments can be configured in `.env.test`, `.env.staging`, `.env.production`, etc.

In addition to the normal Heroku variables you may set up via Heroku commands and find in `heroku config -s` output, Pine2e defines the following ones:

* `HEROKU_APP` specifies the name of the Heroku app for the given environment (frequently passed as `--app $HEROKU_APP` to Heroku commands); this must be specified for staging and production envs (i.e. `.env.staging` and `.env.production`), otherwise many Grunt commands won't work
* `GIT_REMOTE` specifies the name of the Git deployment remote for the given environment, if it's different from the name of the environment


## How to create a Pine2e app

Create a new folder:

    mkdir example
    cd example

Create package.json:

    {
      "name": "example",
      "version": "0.0.0"
    }

Install Pine2e and Grunt:

    npm install pine2e --save
    npm install grunt grunt-es6-transpiler --save-dev

Create Gruntfile.js:

    module.exports = function(grunt) {

      grunt.initConfig({
        'es6-transpiler': {
          lib: {
            files: {
              expand: true,
              cwd: 'src/',
              src: '**/*.js',
              dest: 'lib/'
            }
          }
        }
      });

      grunt.loadNpmTasks('pine2e');
      grunt.loadNpmTasks('grunt-es6-transpiler');

    };

This enables `p2e:...` tasks, and also ES6 transpiler will compile src/ into lib/.

Create server.js:

    require('./app').startServer();

Create app.js:

    module.exports = require('pine2e').initializeApp(__dirname);

Create src/config.js:




Create a typical Express.js app (be sure to add `package.json`), cd into its directory and run:

    npm install pine2e --save
    npm install grunt --save-dev

Put this into Gruntfile.js:

    module.exports = function(grunt) {

      grunt.initConfig({
      });

      grunt.loadNpmTasks('pine2e');

    };

Set up staging and production Heroku apps, for each one:

1. Create the app.
2. Add it as a Git remote locally (preferably, use `staging` and `production` remote names).
3. Add a PostgreSQL database.
4. Promote the PostgreSQL database into `DATABASE_URL`.
5. Add any other add-ons you need.

Dump Heroku config into local env files:

    heroku config -s --app myapp-production >.env.production
    echo "HEROKU_APP=myapp-production" >>.env.production

    heroku config -s --app myapp-staging >.env.staging
    echo "HEROKU_APP=myapp-staging" >>.env.staging

You can also set `GIT_REMOTE` to the name of the Heroku remotes, if they don't match the environment names (“staging”, “production”).

Set up `.env` for the local development environment. In many cases, you want to copy `.env.staging` into `.env` and then customize it.

Run the app using:

    foreman start -e .env


## Grunt tasks

Be sure to `npm install -g grunt-cli` if you haven't already.

To dump the schema of ‘dev’ environment's database into schema.sql:

    grunt p2e:schema:dump

To copy the database from production to staging, overwriting the staging database:

    grunt p2e:db:copy:production:staging

To deploy:

    p2e:deploy:staging
    p2e:deploy:production

To run an arbitrary Heroku command in the given environment's app:

    p2e:heroku:staging:ps
    p2e:heroku:staging:config
    p2e:heroku:staging:pgbackups:restore
    # note: currently there's no way to pass arguments


## Tests

Uses mocha, run `npm test` to execute tests.


## The MIT License

Copyright (c) 2014 Andrey Tarantsov (andrey@tarantsov.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
