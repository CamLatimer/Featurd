require('dotenv').load();

const express = require('express');
const logger = require('morgan');
const app = express();
const bodyParser = require('body-parser');

if(process.env.NODE_ENV !== 'test') app.use(logger('dev'));

app.use('/dist', express.static('dist'))
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json());


app.get('/', (req, res) => {
  res.render('home', {hello: 'hey man'});
});

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

module.exports = app;
