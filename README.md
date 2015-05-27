# session-data

The sessionData is a special area of the session used for storing data.  Data
are written to the sessionData and cleared after being used by the user.  The
sessionData is typically used in combination with redirects, ensuring that the data
is available to the next page that is to be rendered.

## Install

    $ npm install session-data

## Usage

#### Express 3.x

sessionData are stored in the session.  First, setup sessions as usual by
enabling `cookieParser` and `session` middleware.  Then, use `sessionData` middleware
provided by session-data.

```javascript
var sessionData = require('session-data');
var app = express();

app.configure(function() {
  app.use(express.cookieParser('keyboard cat'));
  app.use(express.session({ cookie: { maxAge: 60000 }}));
  app.use(sessionData());
});
```

With the `sessionData` middleware in place, all requests will have a `req.sessionData()` function
that can be used for sessionData.

```javascript
app.get('/sessionData', function(req, res){
  // Set a flash message by passing the key, followed by the value, to req.sessionData().
  req.sessionData('info', 'Flash is back!')
  res.redirect('/');
});

app.get('/', function(req, res){
  // Get an array of sessionData by passing the key to req.sessionData()
  res.render('index', { sessionData: req.sessionData('info') });
});
```

## Examples

Todo

## Tests

    $ npm install --dev
    $ make test

[![Build Status](https://secure.travis-ci.org/Asw20/session-data.png)](http://travis-ci.org/Asw20/session-data)

## Credits

  - [Nicolas Rollin](http://github.com/Asw20)
  - [Jared Hanson](http://github.com/jaredhanson)


## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2012-2015 Nicolas Rollin <[http://objclt.com/](http://objclt.com/)>
