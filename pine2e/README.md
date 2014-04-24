# pine2e

Pinetwo's pluggable stack for [twelve-factor web apps](http://12factor.net) based on Express.js and PostgreSQL. Runs on Heroku and similar environments.

Under development. Normally, parts of the stack are developed elsewhere and then extracted from production apps.


## How to create a Pine2e app

Create a new folder:

    mkdir example
    cd example

Create package.json:

    {
      "name": "example",
      "version": "0.0.0",
      "private": true
    }

Install npm packages:

    npm install pine2e --save
    npm install debug --save
    npm install supervisor --save-dev
    npm install grunt grunt-es6-transpiler grunt-contrib-less --save-dev

Create Gruntfile.js to set up `p2e:...` tasks, ES6 transpiler and LESS compiler:

    module.exports = function(grunt) {

      grunt.initConfig({
        es6transpiler: {
          server: {
            expand: true,
            cwd: 'src/',
            src: '**/*.js',
            dest: 'lib/'
          },
          client: {
            expand: true,
            cwd: 'assets/js6/',
            src: '**/*.js',
            dest: 'assets/js/',
            options: {
              globals: {
                "jQuery": false
              }
            }
          }
        },
        less: {
          client: {
            files: {
              "assets/css/styles.css": "assets/less/styles.less"
            }
          }
        }
      });

      grunt.loadNpmTasks('pine2e');
      grunt.loadNpmTasks('grunt-es6-transpiler');
      grunt.loadNpmTasks('grunt-contrib-less');

      grunt.registerTask('server', ['es6transpiler:server']);
      grunt.registerTask('client', ['es6transpiler:client', 'less']);
      grunt.registerTask('default', ['client', 'server']);

    };

Create server.js:

    require('./app').startServer();

Create app.js:

    module.exports = require('pine2e').initializeRootApp(__dirname);

Create src/config.js:

    exports.configureApp = function(app) {

    };

    exports.configureRootApp = function(app) {

    };

Create src/routes.js:

    module.exports = function(app) {
      app.get('/', (req, res) => {
        res.render('home');
      })
    }

Create views/home.jade:

    extends layout

    block content
      .container
        h1 Hello, world!

Create views/layout.jade (this example uses Bootstrap, Google Fonts and LiveReload):

    doctype html
    html(lang="en")
      head
        meta(charset='utf8')
        meta(http-equiv="X-UA-Compatible", content="IE=edge")
        link(href='http://fonts.googleapis.com/css?family=Droid+Sans:400,700', rel='stylesheet', type='text/css')
        link(href='/bower_components/bootstrap/dist/css/bootstrap.min.css', rel='stylesheet', type='text/css')
        link(href='/assets/css/styles.css', rel='stylesheet', type='text/css')

        <!--[if lt IE 9]>
        script(src="/bower_components/html5shiv/dist/html5shiv.min.js")
        script(src="/bower_components/respond/dest/respond.min.js")
        <![endif]-->

        title Example
      body
        header
          .container
            .col-sm-8
              p Hello
            .col-sm-4
              p World

        block content

        script(src="/bower_components/jquery/jquery.min.js")
        script(src="/bower_components/bootstrap/dist/js/bootstrap.min.js")
        script(src="/assets/js/app.js")
        script.
          if ((location.host || '').split(':')[0] === 'localhost')
            document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')

Create assest/less/styles.less:

    h1 {
        color: red;
    }

Create assets/js6/app.js:

    jQuery(function($) {
        $('h1').click((e) => {
            e.preventDefault();
            $('h1').after('<p>Hello from JavaScript</p>');
        })
    });

Compile all assets (note: LiveReload is recommended for ongoing compilation):

    grunt

Create bower.json:

    {
      "private": true,
      "dependencies": {
        "jquery": "~1.9.0",
        "bootstrap": "~3.1.0",
        "html5shiv": "~3.7.1",
        "respond": "~1.4.2"
      }
    }

then install Bower components:

    bower install

Create Procfile for Heroku:

    web: node server.js

Create Procfile.dev for auto-restarting development server:

    web: ./node_modules/.bin/supervisor -i assets,migrations,views,src,test server.js

If you use CoffeeScript and/or Streamline.js, you need to add `-x` and `-e` to Procfile.dev:

    web: ./node_modules/.bin/supervisor -x ./node_modules/.bin/_coffee -e '_coffee|coffee' -i assets,migrations,views,src,test server.js

Start your local PostgreSQL server (Postgres.app recommended).

Create a dev database in the local PostgreSQL installation:

    echo 'CREATE DATABASE example_dev' | psql -d postgres

Set up your development environment in `.env` pointing to your local PostgreSQL database:

    PORT=5000
    DATABASE_URL=postgres://andreyvit:@localhost:5432/example_dev

Create staging and production Heroku apps:

    heroku apps:create --remote staging example-staging
    heroku apps:create --remote production example

Add PostgreSQL addon with automatic backups:

    heroku addons:add --app example-staging heroku-postgresql
    heroku pg:promote --app example-staging HEROKU_POSTGRESQL_YELLOW_URL  # use your URL
    heroku addons:add --app example-staging pgbackups:auto-month

    heroku addons:add --app example heroku-postgresql
    heroku pg:promote --app example HEROKU_POSTGRESQL_AMBER_URL  # use your URL
    heroku addons:add --app example pgbackups:auto-month

Set up SESSION_SECRET, a required config variable to prevent session hijacking attacks:

    heroku config:set --app example-staging "SESSION_SECRET=asdfghjklasdfghjkl"
    heroku config:set --app example "SESSION_SECRET=zxcvbnmzxcvbnm"
    echo "SESSION_SECRET=qwertyuiop" >>.env

Set up logging:

    heroku config:set --app example-staging "DEBUG=sql,p2e:*,app:*"
    heroku config:set --app example "DEBUG=sql,p2e:*,app:*"
    echo "DEBUG=sql,p2e:*,app:*" >>.env

This enables logging of all SQL statements, all Pine2e messages and all messages coming from your app (as long as you use `app:smt` for your app's logging via the debug module). In the future you may want to log less in production.

Dump Heroku config into local env files:

    heroku config -s --app example-staging >.env.staging
    echo "HEROKU_APP=myapp-staging" >>.env.staging

    heroku config -s --app example >.env.production
    echo "HEROKU_APP=example" >>.env.production

You can also set `GIT_REMOTE` to the name of the Heroku remotes, if they don't match the environment names (“staging”, “production”).

Run the app using:

    foreman start

Run the app in autorestarting mode using:

    foreman start -f Procfile.dev

Lock dependency versions for reproducable deployments (you need to rerun this command after any package.json dependency changes):

    npm shrinkwrap

Commit everything into Git, then deploy to Heroku using:

    grunt p2e:deploy:staging
    grunt p2e:deploy:production


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
