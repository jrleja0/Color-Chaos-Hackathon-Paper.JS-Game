/* global Group, io, Path, Point, PointText, project, Raster, Rectangle, Size, Symbol, Tool, view */

var socket = io();

console.log('running-- w:', view.size.width, '&& h:', view.size.height);
//const largerScreenDim = view.size.width > view.size.height ? view.size.width : view.size.height;


//// creating background Symbols ////
function createBackground(rasterColor) {
  var quadrantSize = new Size(view.size.width / 2, view.size.height / 2);
  var quadrant = new Path.Rectangle(new Point(0, 0), quadrantSize);
  var backgroundRaster = new Raster(rasterColor);
  //// cropping/masking backgroundRaster onto quadrant ////
  var colorQuadrantGroup = new Group({
    children: [quadrant, backgroundRaster],
    clipped: true
  });
  backgroundRaster.fitBounds(quadrant.bounds, true);  //  "true" means background will fill the entire bounds, even if image is cropped.
  var symbol = new Symbol(colorQuadrantGroup);
  symbol.colorName = rasterColor;
  symbol.background = true;
  return symbol;
}

var blueBackgroundSymbol = createBackground('bluePattern');
var greenBackgroundSymbol = createBackground('greenPattern');
var redBackgroundSymbol = createBackground('redPattern');
var yellowBackgroundSymbol = createBackground('yellowPattern');


//// creating four quadrants ////
function createQuadrant(point) {
  var quadrantSize = new Size(view.size.width / 2, view.size.height / 2);
  return new Rectangle(point, quadrantSize); // Rectangle: point is top-right
}

var quadrant0 = createQuadrant(new Point(0, 0));
var quadrant1 = createQuadrant(new Point(view.size.width / 2, 0));
var quadrant2 = createQuadrant(new Point(0, view.size.height / 2));
var quadrant3 = createQuadrant(new Point(view.size.width / 2, view.size.height / 2));


//// function to add background Symbols to quadrants ////
var backgroundGroup = new Group();
backgroundGroup.name = 'backgroundGroup';

function addToQuadrant(quadrant) {
  return function (backgroundSymbol) {
    // console.log(backgroundSymbol);
    // console.log(quadrant.x, quadrant.y, quadrant);
    var symbol = backgroundSymbol.place(quadrant.center);
    backgroundGroup.addChild(symbol);
    quadrant.colorName = backgroundSymbol.colorName;
  };
}

var addToQuadrant0 = addToQuadrant(quadrant0);
var addToQuadrant1 = addToQuadrant(quadrant1);
var addToQuadrant2 = addToQuadrant(quadrant2);
var addToQuadrant3 = addToQuadrant(quadrant3);


//// actually adding the backgrounds to the canvas:

function initializingQuadrantBackgrounds(){
  addToQuadrant0(blueBackgroundSymbol);
  addToQuadrant1(greenBackgroundSymbol);
  addToQuadrant2(redBackgroundSymbol);
  addToQuadrant3(yellowBackgroundSymbol);
}
initializingQuadrantBackgrounds();



//// TO DO:
//// create symbol
//// place each color symbol in each quadrant
//// change whether it is visible or not.



//// creating circle symbols ////
var createCircleSymbol = function(color, rotationDegree) {
  var smallerViewDim = Math.min(view.size.height, view.size.width);
  var circle = new Path.Circle(new Point(100, 100), smallerViewDim / 12);    //  Path.Circle(new Point(100, 100), 60);
  var colorBackground = new Raster(color);
  colorBackground.scale(0.25);
  //// cropping/masking colorBackground onto circle ////
  var colorCircleGroup = new Group({
    children: [circle, colorBackground],
    clipped: true
  });
  colorBackground.fitBounds(circle.bounds);
  var symbol = new Symbol(colorCircleGroup);
  symbol.colorName = color;
  symbol.background = false;
  symbol.radius = smallerViewDim / 12;
  return symbol;
};

var blueSymbol = createCircleSymbol('bluePattern');
var greenSymbol = createCircleSymbol('greenPattern');
var redSymbol = createCircleSymbol('redPattern');
var yellowSymbol = createCircleSymbol('yellowPattern');



//// placing circle symbols:
var yel1 = yellowSymbol.place(quadrant3.center);
var red1 = redSymbol.place(quadrant2.center);
var gre1 = greenSymbol.place(quadrant1.center);
var blu1 = blueSymbol.place(quadrant0.center);

var symbolsGroup = new Group([yel1, red1, gre1, blu1]);
symbolsGroup.name = 'symbolsGroup';

console.log(project.activeLayer.children);
// console.log(yellowSymbol.name === yellowBackgroundSymbol.name);
// console.log(blueSymbol.name === blueBackgroundSymbol.name);
// console.log(greenSymbol.name === greenBackgroundSymbol.name);
// console.log(redSymbol.name === redBackgroundSymbol.name);


  //// testing the .definition.colorName and .definition.background properties on the instances:
  for (var a = 0; a < backgroundGroup.children.length; a++) {
    console.log('backGroup', 'name', backgroundGroup.children[a].definition.colorName, 'background', backgroundGroup.children[a].definition.background);
  }

  for (var b = 1; b < symbolsGroup.length; b++) {
    console.log('name', symbolsGroup.children[b].definition.colorName, 'background', symbolsGroup.children[b].definition.background);
  }
  console.log(quadrant0.colorName);
  console.log(quadrant1.colorName);
  console.log(quadrant2.colorName);
  console.log(quadrant3.colorName);


// testing midpoint:
// console.log(view.bounds.center);
// var circleMidPoint = new Path.Circle(view.bounds.center, 10);
// circleMidPoint.fillColor = 'white';


  // project.activeLayer.children[0].remove();
  // project.activeLayer.children[1].remove();
  // project.activeLayer.children[2].remove();
  // project.activeLayer.children[3].remove();

  console.log('child num', project.activeLayer.children);
console.log(quadrant0);

  // project.activeLayer.children.insertChild(0, )



//// instantiating onMouseDown ////
var tool = new Tool(),
  selectedObject = null,
  dragCounter = 0,
  score = 0,
  gameNotStarted = true,
  player1 = false;

function resetObjectVectorAndDragCounter(object, broadcast) {
    if (broadcast) socket.emit('mouseDown', object);
    selectedObject = object;
    selectedObject.newVectorX = 0;
    selectedObject.newVectorY = 0;
    dragCounter = 0;
}

tool.onMouseDown = function(e) {
  // console.log('mouse down');
  var hitResult = project.activeLayer.hitTest(e.point);
  if (hitResult) {
    // functionality to start game:
    if (gameNotStarted) {
      // console.log('hitting here');
      var color = hitResult.item.definition.colorName;
      var background = hitResult.item.definition.background;
      // console.log(color, '&&', background);
      if (background) return;
      gameNotStarted = false;
      if (color === 'bluePattern' && !background) {
        player1 = true;
        socket.emit('startGame');
      } else if (color === 'greenPattern' && !background) {
        socket.emit('startGame');
      } else if (color === 'redPattern' && !background) {
        socket.emit('startGame');
      } else if (color === 'yellowPattern' && !background) {
        socket.emit('startGame');
      }
    }
    // functionality during game play:
    else {
      resetObjectVectorAndDragCounter(hitResult.item, true);
    }
  }
};


function setNewVectorOnDrag(x, y, broadcast) {
  console.log('hitting here')
  if (selectedObject && dragCounter < 1) {
    if (broadcast) socket.emit('mouseDrag', x, y);
    selectedObject.newVectorX += x / 10;  // x / 10 and 1 drag event.
    selectedObject.newVectorY += y / 10;
  }
}

//// instantiating onMouseDrag ////
tool.onMouseDrag = function(e) {
  //console.log(e.delta);
  var x = e.delta.x, y = e.delta.y;
  setNewVectorOnDrag(x, y, true);
};


function symbolBoundsCreator(symbol) {
  return ([
    (symbol.position - new Point(symbol.definition.radius, 0)),  // leftCenter point
    (symbol.position + new Point(symbol.definition.radius, 0)),  // rightCenter point
    (symbol.position - new Point(0, symbol.definition.radius)),  // topCenter point
    (symbol.position + new Point(0, symbol.definition.radius))   // bottomCenter point
  ]);
}


function overQuadrant0(point) {
  return point.x < view.bounds.center.x && point.y < view.bounds.center.y;
}
function overQuadrant1(point) {
  return point.x > view.bounds.center.x && point.y < view.bounds.center.y;
}
function overQuadrant2(point) {
  return point.x < view.bounds.center.x && point.y > view.bounds.center.y;
}
function overQuadrant3(point) {
  return point.x > view.bounds.center.x && point.y > view.bounds.center.y;
}

function checkingQuadrantOverlap(symbolPoint) {
  if (overQuadrant0(symbolPoint)) {
    return quadrant0;
  } else if (overQuadrant1(symbolPoint)) {
    return quadrant1;
  } else if (overQuadrant2(symbolPoint)) {
    return quadrant2;
  } else if (overQuadrant3(symbolPoint)) {
    return quadrant3;
  }
}

function checkingColorMatch(symbol, quadrant) {
  if (!symbol || !quadrant) {
    return false;
  } else {
    return symbol.definition.colorName === quadrant.colorName;
  }
}

function symbolInBounds(symbolBounds) {
  var leftCenter = symbolBounds[0],
    rightCenter = symbolBounds[1],
    topCenter = symbolBounds[2],
    bottomCenter = symbolBounds[3];
  return (rightCenter.x > 0 && leftCenter.x < view.bounds.width &&  // returns true if in bounds.
    bottomCenter.y > 0 && topCenter.y < view.bounds.height);
}


//// onFrame function (not yet called on view.onFrame):
var startText,
  startTextOptions = {
    name: 'startText',
    position: new Point((view.bounds.width / 10), (view.bounds.height / 2)),
    fontSize: 100,
    fillColor: 'white',
    content: 'Get Ready!'
  };

function endGame() {
  view.off('frame');
  socket.emit('endGame', score);
}


var animateGame = function(e) {
  //console.log(selectedObject ? selectedObject.newVectorX : null);
  if (e.count === 1) startText = new PointText(startTextOptions);
  if (e.count === 80) {
    startText.content = 'GO!';
    startText.position.x = view.bounds.width / 3;
  }
  if (e.count === 170) startText.remove();

  if (player1 && e.count > 179 && e.count % 8 === 0) {  // e.count % 8
    // console.log(e.count);
    //randomSymbolSeeder();
    socket.emit('addSymbol');
  }


  //// rotate circle symbols:
  blueSymbol.definition.rotate(1);
  greenSymbol.definition.rotate(1);
  redSymbol.definition.rotate(-1);
  yellowSymbol.definition.rotate(-1);

  // for (var a = 0; a < project.activeLayer.children.length; a++) {
  //   var symbol = project.activeLayer.children[a];
  //   if (symbol.name === 'backgroundGroup' ||
  //   symbol.name === 'startText' ||
  //   symbol.definition.background) continue;  // if it is not a symbol, then continue loop.

  //// iterating through symbols:
  for (var a = 0; a < symbolsGroup.children.length; a++) {
    var symbol = symbolsGroup.children[a];
    // console.log('newSy2', symbol);
    //// adding/subtracting from score for each symbol:
    var symbolBounds = symbolBoundsCreator(symbol);  // finding leftCenter, rightCenter, topCenter, bottomCenter points
    if (!symbolInBounds(symbolBounds)) {
      symbol.remove();
      a--;
      continue;
    }

    //// iterating through symbolBounds' points
    for (var b = 0; b < symbolBounds.length; b++) {
      var borderingQuadrant = checkingQuadrantOverlap(symbolBounds[b]);  // returns quadrant that symbolPoint overlaps.
      var colorMatch = checkingColorMatch(symbol, borderingQuadrant);  // Boolean
      score += colorMatch ? 2 : -1;
    }

    //// keeping track of score
    e.count % 50 === 0 ? console.log('SCORE!', score) : null;

    //// moving each symbol
    if (symbol.newVectorX || symbol.newVectorY) {
      symbol.position.x += symbol.newVectorX;
      symbol.position.y += symbol.newVectorY;
    } else {
      symbol.position += new Point(5, 0);
    }
  }

  if (e.count === 3600) {  // test 410
    startText.content = 'Almost Done!';
    startText.fontSize = 80;
    startText.position.x -= 40;
    project.activeLayer.addChild(startText);
  }
  if (e.count === 3700) startText.remove();  // test 510
  if (e.count === 3810) {  // test 630
    project.activeLayer.addChild(startText);
    startText.content = '3';
  }
  if (e.count === 3870) {  // test 690
    startText.position.x += 200;
    startText.content = '2';
  }
  if (e.count === 3930) {  // test 750
    startText.position.x += 200;
    startText.content = '1';
  }
  if (e.count === 3990) {  // test 810
    startText.position.x -= 400;
    startText.content = 'Stop!';
  }
  if (e.count === 4006) {  // test 818 // 6000
    endGame();
  }
};



function createSymbol(randomSymbolType, newPositionX, newPositionY, newVectorX, newVectorY) {
  var symbolTypes = [blueSymbol, greenSymbol, redSymbol, yellowSymbol];
  var newSymbol = symbolTypes[randomSymbolType].place(new Point(newPositionX, newPositionY));
  symbolsGroup.addChild(newSymbol);
  newSymbol.newVectorX = newVectorX;
  newSymbol.newVectorY = newVectorY;
  // console.log('newsymb', symbolsGroup.children);
}

function startAnimation(animateGameFn) {
  //console.log(animateGameFn);
  //initializingQuadrantBackgrounds();
  view.onFrame = animateGameFn;
}

socket.on('startGame', function() {
  console.log('starting game via socket!!!');
  gameNotStarted = false;
  startAnimation(animateGame);
});

// socket.on('addSymbol', function(randomSymbolType, newPositionX, newPositionY, newVectorX, newVectorY) {
//   console.log('seed', typeof randomSymbolType, typeof newPositionX, typeof newPositionY, typeof newVectorX, typeof newVectorY);
//   createSymbol(randomSymbolType, newPositionX, newPositionY, newVectorX, newVectorY);
// });
socket.on('addSymbol', function(newSymbolInfo) {
  // console.log(newSymbolInfo);
  var newSymbol = createSymbol(newSymbolInfo['randomSymbolType'], newSymbolInfo['newPositionX'], newSymbolInfo['newPositionY'], newSymbolInfo['newVectorX'], newSymbolInfo['newVectorY']);
  // console.log('newSymb', newSymbol);
});


socket.on('mouseDown', resetObjectVectorAndDragCounter);

socket.on('mouseDrag', setNewVectorOnDrag);

socket.on('endGame', function(scores) {
  console.log(score);
  console.log(scores);
  var rank = scores.indexOf(score) + 1;
  var players = scores.length;
  startText.remove();
  var outcomeText = new PointText({
    name: 'outcomeText',
    content: rank === 1 ? 'You Won!' : 'Try Again!',
    fillColor: rank === 1 ? 'yellow' : 'brown',
    fontSize: 100,
    position: new Point(quadrant0.width, 100)
  });
  project.activeLayer.addChild(outcomeText);
  var rankText = new PointText({
    name: 'rankText',
    content: 'You ranked ' + rank + ' out of ' + players + ' players.',
    fillColor: 'white',
    fontSize: 40,
    position: new Point(quadrant0.width, view.bounds.height / 2 - 50)
  });
  project.activeLayer.addChild(rankText);
});


// function randomSymbolSeeder(){
//   //blueSymbol.place(quadrant3.center);

//   var symbolRadius = blueSymbol.radius;
//   var randomSideOfScreen = Math.floor(Math.random() * 4); // top-right-bottom-left
//   var newSymbolLocation, newPositionX, newPositionY;
//   var randomPointX = Math.random() * view.bounds.width + 0.1;
//   var randomPointY = Math.random() * view.bounds.height + 0.1;
//   var pointX, pointY, newVectorX, newVectorY;
//   //// creating random point to enter from off-screen,
//   /// and newVectorX and newVectorY:
//   if (randomSideOfScreen === 0) {  // top
//     pointY = -(symbolRadius);
//     //newSymbolLocation = new Point(randomPointX, pointY);
//     newPositionX = randomPointX;
//     newPositionY = pointY;
//     newVectorX = Math.random() * 14 - 7 + 0.1;
//     newVectorY = Math.random() * 7 + 0.1;
//   } else if (randomSideOfScreen === 2) {  // bottom
//     pointY = (view.bounds.height + symbolRadius);
//     //newSymbolLocation = new Point(randomPointX, pointY);
//     newPositionX = randomPointX;
//     newPositionY = pointY;
//     newVectorX = Math.random() * 14 - 7 + 0.1;
//     newVectorY = -(Math.random() * 7 + 0.1);
//   } else if (randomSideOfScreen === 3) {  // left
//     pointX = -(symbolRadius);
//     //newSymbolLocation = new Point(pointX, randomPointY);
//     newPositionX = pointX;
//     newPositionY = randomPointY;
//     newVectorX = Math.random() * 7 + 0.1;
//     newVectorY = Math.random() * 14 - 7 + 0.1;
//   } else if (randomSideOfScreen === 1) {  // right
//     pointX = (view.bounds.width + symbolRadius);
//     //newSymbolLocation = new Point(pointX, randomPointY);
//     newPositionX = pointX;
//     newPositionY = randomPointY;
//     newVectorX = -(Math.random() * 7 + 0.1);
//     newVectorY = Math.random() * 14 - 7 + 0.1;
//   }
//   //// creating random symbol type:
//   var randomSymbolType = Math.floor(Math.random() * 4);
//   //var newSymbolType = symbolTypes[randomSymbolType];

//   // if emitting to other sockets, uncomment the line below:
//   //socket.emit('addSymbol', randomSymbolType, newPositionX, newPositionY, newVectorX, newVectorY);
//   createSymbol(randomSymbolType, newPositionX, newPositionY, newVectorX, newVectorY);
// }





// //   //// populate symbol objects ////
// //   const seedYellowSymbol = () => {
// //     yellowSymbol.place(view.size.multiply(Point.random()));
// //   };
// //   const seedBlueSymbol = () => {
// //     blueSymbol.place(view.size.multiply(Point.random()));
// //   };


// //   let fading = true;
// //   view.onFrame = (e) => {
// //     // console.log(e.count);
// //     //// seed the yellow and blue symbols ////
// //     if (e.count < 31) {
// //       e.count % 5 === 0 ? seedBlueSymbol() : seedYellowSymbol();
// //     }
// //     // symbols begin to rotate
// //     if (e.count > 20) {
// //       yellowSymbol.definition.rotate(1);
// //       blueSymbol.definition.rotate(-3);
// //     }
// //     // symbols begin to move in random directions
// //     // saving newPointX and newPointY to each symbol obj instance, so that symbol instance goes in a particular direction in each frame.
// //     // direction will be reassigned every 20 frames.
// //     if (e.count > 39 && e.count % 20 === 0) {
// //       for (let i = 4; i < project.activeLayer.children.length; i++) {  // forEach will not work properly.
// //         let symbol = project.activeLayer.children[i];
// //         // assign points between -5 and +5, every 20 frames:
// //         symbol.newPointX = Math.random() * 10 - 5;
// //         symbol.newPointY = Math.random() * 10 - 5;
// //       }
// //     }
// //     // change symbols' positions
// //     if (e.count > 39) {
// //       for (let i = 1; i < project.activeLayer.children.length; i++) {
// //         let symbol = project.activeLayer.children[i];
// //         symbol.position.x += symbol.newPointX;
// //         symbol.position.y += symbol.newPointY;
// //         // symbol.position.x += symbol.bounds.width / 20; // uncomment to have all symbols move to the right.
// //       }
// //     }
// //     //// green background fades in and out ////
// //     if (greenBackground.opacity < 0.05) fading = false;
// //     if (greenBackground.opacity > 0.95) fading = true;
// //     fading ? greenBackground.opacity -= 0.003 : greenBackground.opacity += 0.003;
// //   };
// };
