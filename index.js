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
app.get('/features/:artistId', spotify.getFeatures);


// error handling
app.use(function(req, res, next){
   let err = new Error(`Oops! We didn't find anything! Please go back...`);
   err.status = 404;
   next(err);
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }
  res.status = err.status || 500;
  res.json({
    error: {
      status: res.status,
      message: err.message
    }
  })
});

if(process.env.NODE_ENV == 'test'){
  module.exports = { app };
} else {
  app.listen(process.env.PORT || 8080, () => {
      console.log('The application is running!');
  });
}
