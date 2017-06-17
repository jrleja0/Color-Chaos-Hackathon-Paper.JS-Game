/* global io */
// hook into events being emitted.

window.onload = function(){
  const socket = io(window.location.origin);  // URL of page
    console.log(window.game);
  // on game event, emit game to socket.
  window.game.on('game', gameAnimation => {
    console.log('gameAnimation');
    socket.emit('game', gameAnimation);
  });

  socket.on('connect', () => {
    console.log('made persistent connection');
  });

  // on receiving game event, call view.onFrame
  socket.on('game', window.game.startAnimation);


  window.game.on('hello', () => {
    console.log('hello window');
    socket.emit('hello');
  });

  socket.on('hello', window.game.hello);






  // resize screen
  // click button to start frames
}
