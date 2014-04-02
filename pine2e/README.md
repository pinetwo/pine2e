# pine2e

Pinetwo's pluggable web stack based on Express.js and PostgreSQL.


## Installation

    npm install pine2e


## Creating Pine2e apps

Predefined environments:

* dev (used by default for migrations, for dumping schema etc)
* staging (no special treatment currently)
* production (additional precautions for production deployment, db:copy refuses to overwrite production db)

Store per-environments Heroku config vars in e.g. `.env.staging`, `.env.production`, etc.

Run the app using:

    foreman start -f Procfile.dev -e .env.staging

Aside from Heroku config variables, you can set:

* `HEROKU_APP` (must be set to run any Heroku-dependent commands, excluding p2e:deploy)
* `GIT_REMOTE` (defaults to the environment's name)


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
