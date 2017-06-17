/* global game, Group, io, Path, Point, project, Raster, Rectangle, Symbol, Tool, view */

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

addToQuadrant0(blueBackgroundSymbol);
addToQuadrant1(greenBackgroundSymbol);
addToQuadrant2(redBackgroundSymbol);
addToQuadrant3(yellowBackgroundSymbol);





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
yellowSymbol.place(quadrant3.center);
redSymbol.place(quadrant2.center);
greenSymbol.place(quadrant1.center);
blueSymbol.place(quadrant0.center);

console.log(project.activeLayer.children);
// console.log(yellowSymbol.name === yellowBackgroundSymbol.name);
// console.log(blueSymbol.name === blueBackgroundSymbol.name);
// console.log(greenSymbol.name === greenBackgroundSymbol.name);
// console.log(redSymbol.name === redBackgroundSymbol.name);


  //// testing the .definition.colorName and .definition.background properties on the instances:
  for (var a = 0; a < backgroundGroup.children.length; a++) {
    console.log('backGroup', 'name', backgroundGroup.children[a].definition.colorName, 'background', backgroundGroup.children[a].definition.background);
  }

  for (var b = 1; b < project.activeLayer.children.length; b++) {
    console.log('name', project.activeLayer.children[b].definition.colorName, 'background', project.activeLayer.children[b].definition.background);
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
  gameNotStarted = true;

tool.onMouseDown = function(e) {
  console.log('mouse down');
  var hitResult = project.activeLayer.hitTest(e.point);
  if (hitResult) {
    selectedObject = hitResult.item;
    // functionality to start game:
    if (gameNotStarted) {
      var color = selectedObject.definition.colorName;
      var background = selectedObject.definition.background;
      console.log(color, '&&', background);
      if (background) return;
      gameNotStarted = false;
      if (color === 'bluePattern' && !background) {
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
      selectedObject.newVectorX = 0;
      selectedObject.newVectorY = 0;
      dragCounter = 0;
    }
  }
};

//// instantiating onMouseDrag ////
tool.onMouseDrag = function(e) {
  //console.log(e.delta);
  if (selectedObject && dragCounter < 1) {
    selectedObject.newVectorX += e.delta.x / 10;  // x / 10 and 1 drag event.
    selectedObject.newVectorY += e.delta.y / 10;
  }
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
var animateGame = function(e) {
  //console.log(selectedObject ? selectedObject.newVectorX : null);

  //// rotate circle symbols:
  blueSymbol.definition.rotate(1);
  greenSymbol.definition.rotate(1);
  redSymbol.definition.rotate(-1);
  yellowSymbol.definition.rotate(-1);

  //// iterating through symbols:
  for (var a = 0; a < project.activeLayer.children.length; a++) {
    var symbol = project.activeLayer.children[a];
    if (symbol.name === 'backgroundGroup' || symbol.definition.background) continue;  // if it is not a symbol, then continue loop.

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
};

function startAnimation(animateGameFn) {
  //console.log(animateGameFn);
  view.onFrame = animateGameFn;
}

socket.on('startGame', function() {
  console.log('starting game via socket!!!');
  startAnimation(animateGame);
});

// game.hello = function() {
//   console.log('hello world');
// };
// game.emit('hello');


// game.emit('game', gameAnimation);



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
