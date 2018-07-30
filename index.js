require('dotenv').load();

const express = require('express');
const logger = require('morgan');
const app = express();
const bodyParser = require('body-parser');
const spotify = require('./spotify');
const axios = require('axios');


if(process.env.NODE_ENV !== 'test') {
  // log req/res info
  app.use(logger('dev'));

  // authenticate with spotify
  spotify.setAuth();
}


// middleware
app.use('/dist', express.static('dist'))
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json());


// routes
app.get('/', (req, res) => { res.render('home', {hello: 'hey man'}) });
app.get('/search/:artistName', spotify.searchArtists);
app.get('/features/:artistName', spotify.getFeatures);


if(process.env.NODE_ENV !== 'production') {

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

};

if(process.env.NODE_ENV !== 'test'){
  app.listen(process.env.PORT || 8080, () => {
      console.log('The application is running!');
  });
};

module.exports = { app }
