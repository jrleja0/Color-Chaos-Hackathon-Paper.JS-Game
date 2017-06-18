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

const server = app.listen(8000, (err) => {
  if (err) throw err;
  console.log('listening on 8000');
});

const io = socketio(server);

// io receives newly connected socket
io.on('connection', (socket) => {
  console.log(':) Client connected. Id:', socket.id);

  socket.on('startGame', () => {
    //console.log(animateGameFn, '!!!!');
    io.emit('startGame');
  });

  // not mirroring properly.
  // socket.on('addSymbol', (randomSymbolType, newPositionX, newPositionY, newVectorX, newVectorY) => {
  //   socket.broadcast.emit('addSymbol', randomSymbolType, newPositionX, newPositionY, newVectorX, newVectorY);
  // });
  socket.on('addSymbol', () => {
    var newSymbolInfo = randomSymbolSeeder();
    io.emit('addSymbol', newSymbolInfo);
  });

  socket.on('mouseDown', () => {
    socket.broadcast.emit('mouseDown'); // one socket broadcasts event to all other sockets
  });

  socket.on('disconnect', () => {
    console.log(':(');
    io.emit('disconnect', ':( someone disconnected');  // io emits to all sockets
  });
});


module.exports = app;


function randomSymbolSeeder(){
  //blueSymbol.place(quadrant3.center);

  var symbolRadius = 50 // blueSymbol.radius;
  var randomSideOfScreen = Math.floor(Math.random() * 4); // top-right-bottom-left
  var newSymbolLocation, newPositionX, newPositionY;
  var randomPointX = Math.random() * 600 + 0.1;  //  view.bounds.width + 0.1;
  var randomPointY = Math.random() * 600 + 0.1;  //  view.bounds.height + 0.1;
  var pointX, pointY, newVectorX, newVectorY;
  //// creating random point to enter from off-screen,
  /// and newVectorX and newVectorY:
  if (randomSideOfScreen === 0) {  // top
    pointY = -(symbolRadius);
    //newSymbolLocation = new Point(randomPointX, pointY);
    newPositionX = randomPointX;
    newPositionY = pointY;
    newVectorX = Math.random() * 14 - 7 + 0.1;
    newVectorY = Math.random() * 7 + 0.1;
  } else if (randomSideOfScreen === 2) {  // bottom
    pointY = 600 + symbolRadius;  //  (view.bounds.height + symbolRadius);
    //newSymbolLocation = new Point(randomPointX, pointY);
    newPositionX = randomPointX;
    newPositionY = pointY;
    newVectorX = Math.random() * 14 - 7 + 0.1;
    newVectorY = -(Math.random() * 7 + 0.1);
  } else if (randomSideOfScreen === 3) {  // left
    pointX = -(symbolRadius);
    //newSymbolLocation = new Point(pointX, randomPointY);
    newPositionX = pointX;
    newPositionY = randomPointY;
    newVectorX = Math.random() * 7 + 0.1;
    newVectorY = Math.random() * 14 - 7 + 0.1;
  } else if (randomSideOfScreen === 1) {  // right
    pointX = 600 + symbolRadius;  //  (view.bounds.width + symbolRadius);
    //newSymbolLocation = new Point(pointX, randomPointY);
    newPositionX = pointX;
    newPositionY = randomPointY;
    newVectorX = -(Math.random() * 7 + 0.1);
    newVectorY = Math.random() * 14 - 7 + 0.1;
  }
  //// creating random symbol type:
  var randomSymbolType = Math.floor(Math.random() * 4);
  //var newSymbolType = symbolTypes[randomSymbolType];
  return ({
    randomSymbolType,
    newPositionX,
    newPositionY,
    newVectorX,
    newVectorY
  });
  // if emitting to other sockets, uncomment the line below:
  // socket.emit('addSymbol', randomSymbolType, newPositionX, newPositionY, newVectorX, newVectorY);
  //createSymbol(randomSymbolType, newPositionX, newPositionY, newVectorX, newVectorY);
}
