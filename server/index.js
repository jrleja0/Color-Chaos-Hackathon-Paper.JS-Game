const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const socketio = require('socket.io');
const PORT = process.env.PORT || 8000;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, '..', 'node_modules/bootstrap/dist/css/')));
app.use('/paper', express.static(path.join(__dirname, '..', 'node_modules/paper/dist/')));
// app.use('/api', routes);

app.get('*', function (req, res, next) {
  res.sendFile(path.join(__dirname, '../public/html/index.html'));
});

app.use( (err, req, res, next) => {
  console.error(err);
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || 'Internal server error.');
});

const server = app.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`listening on ${PORT}`);
});

const io = socketio(server);

var players = [],
  scores = [];
var createPlayer = (socketId) => {
  return { socketId };
};

// io receives newly connected socket
io.on('connection', (socket) => {
  console.log(':) Client connected. Id:', socket.id);
  players.push(createPlayer(socket.id));
  console.log('players:', players.length);

  io.emit('playerNumChange', players.length);

  socket.on('startGame', () => {
    scores = [];
    io.emit('startGame');  // io emits to all sockets
  });

  socket.on('addSymbol', () => {
    var newSymbolInfo = randomSymbolSeeder();
    io.emit('addSymbol', newSymbolInfo);
  });

  socket.on('mouseDown', (symbolObject) => {
    socket.broadcast.emit('mouseDown', symbolObject);  // one socket broadcasts event to all other sockets
  });

  socket.on('mouseDrag', (x, y) => {
    socket.broadcast.emit('mouseDrag', x, y);
  });

  socket.on('endGame', score => {
    scores.push(score);
    if (scores.length === players.length) {
      //// sort scores
      scores.sort((a, b) =>  b - a);
      console.log('scores', scores);
      io.emit('endGame', scores);
    }
  });

  socket.on('disconnect', () => {
    var playerIdxToDelete = players.map(player => player.socketId).indexOf(socket.id);
    var removedPlayer = players.splice(playerIdxToDelete, 1);
    socket.broadcast.emit('playerNumChange', players.length);
    console.log(':(');
    console.log(playerIdxToDelete, removedPlayer);
    console.log('pl', players);
  });
});

module.exports = app;

function randomSymbolSeeder(){
  var symbolRadius = 50;  // blueSymbol.radius;
  var randomSideOfScreen = Math.floor(Math.random() * 4);  // top-right-bottom-left
  var newPositionX, newPositionY;
  var randomPointX = Math.random() * 600 + 0.1;  //  view.bounds.width + 0.1;
  var randomPointY = Math.random() * 600 + 0.1;  //  view.bounds.height + 0.1;
  var pointX, pointY, newVectorX, newVectorY;
  //// creating random point to enter from off-screen,
  /// and newVectorX and newVectorY:
  if (randomSideOfScreen === 0) {  // top
    pointY = -(symbolRadius);
    newPositionX = randomPointX;
    newPositionY = pointY;
    newVectorX = Math.random() * 14 - 7 + 0.1;
    newVectorY = Math.random() * 7 + 0.1;
  } else if (randomSideOfScreen === 2) {  // bottom
    pointY = 600 + symbolRadius;  //  (view.bounds.height + symbolRadius);
    newPositionX = randomPointX;
    newPositionY = pointY;
    newVectorX = Math.random() * 14 - 7 + 0.1;
    newVectorY = -(Math.random() * 7 + 0.1);
  } else if (randomSideOfScreen === 3) {  // left
    pointX = -(symbolRadius);
    newPositionX = pointX;
    newPositionY = randomPointY;
    newVectorX = Math.random() * 7 + 0.1;
    newVectorY = Math.random() * 14 - 7 + 0.1;
  } else if (randomSideOfScreen === 1) {  // right
    pointX = 600 + symbolRadius;  //  (view.bounds.width + symbolRadius);
    newPositionX = pointX;
    newPositionY = randomPointY;
    newVectorX = -(Math.random() * 7 + 0.1);
    newVectorY = Math.random() * 14 - 7 + 0.1;
  }
  //// creating random symbol type:
  var randomSymbolType = Math.floor(Math.random() * 4);
  return ({
    randomSymbolType,
    newPositionX,
    newPositionY,
    newVectorX,
    newVectorY
  });
  // if emitting to other sockets, uncomment the line below:
  // socket.emit('addSymbol', randomSymbolType, newPositionX, newPositionY, newVectorX, newVectorY);
}
