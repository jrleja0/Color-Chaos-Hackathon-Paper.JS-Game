const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const socketio = require('socket.io');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, '../public/html')));
// app.use(express.static(path.join(__dirname, '../public/css')));
// app.use('/paperscript', express.static(path.join(__dirname, '../public/js')));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/paper', express.static(path.join(__dirname, '../node_modules/paper/dist/')));

// app.use('/api', routes);

app.get('*', function (req, res, next) {
  res.sendFile(path.join(__dirname, '../public/html/index.html'));
});

app.use( (err, req, res, next) => {
  console.error(err);
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || 'Internal server error.');
});

const server = app.listen(8000, (err) => {
  if (err) throw err;
  console.log('listening on 8000');
});

const io = socketio(server);

// receives newly connected socket
io.on('connection', (socket) => {
  console.log(':) Client connected. Id:', socket.id);

  socket.on('startGame', () => {
    //console.log(animateGameFn, '!!!!');
    io.emit('startGame');
  });

  socket.on('disconnect', () => {
    console.log(':(');
    io.emit(':( someone disconnected');
  });
});


module.exports = app;
