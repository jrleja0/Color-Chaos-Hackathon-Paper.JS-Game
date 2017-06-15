import '../scss/index.scss';
// import '../../node_modules/paper/dist/paper-full.min.js';
import './paperscript.js';

import React from 'react';
import ReactDOM from 'react-dom';

// console.log(window.paper);

ReactDOM.render(
  <div>
    <canvas id="mainCanvas" />
    <img id="bluePattern" src="https://raw.githubusercontent.com/jrleja0/Tile-Abstraction/master/Blue%20Tile.jpeg" />
    <img id="greenPattern" src="https://raw.githubusercontent.com/jrleja0/Tile-Abstraction/master/Green%20Tile.jpeg" />
    <img id="yellowPattern" src="https://raw.githubusercontent.com/jrleja0/Tile-Abstraction/master/Yellow%20Tile.jpeg" />
    </div>,
  document.getElementById('app')
);


  // <div>Hello!</div>,
