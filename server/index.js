const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');


app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public/html')));
app.use(express.static(path.join(__dirname, '../public/css')));
app.use('/paper', express.static(path.join(__dirname, '../node_modules/paper/dist/')));
app.use('/paperscript', express.static(path.join(__dirname, '../public/js')));

// app.use('/api', routes);

app.get('*', function (req, res, next) {
  res.sendFile(path.join(__dirname, '../public/html/index.html'));
});

app.use( (err, req, res, next) => {
  console.error(err);
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || 'Internal server error.');
});

app.listen(8000, (err) => {
  if (err) throw err;
  console.log('listening on 8000');
});

module.exports = app;
