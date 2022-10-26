# Pixi Flump
Pixi Flump Library compatible for pixi v6

## How to?

clone the repo and install package locally (for now).

#### Setup
```js
let renderer = PIXI.autoDetectRenderer(500, 500,{backgroundColor : 0x1099bb});
document.body.appendChild(renderer.view);
	
// create container
let stage = new PIXI.Container();
	
// create library
// only describe location to directory, FlumpLibrary will find library.json and the atlas0.png in that directory.
// see example export in ./test/assets/flump/animation-100/cube
let library = new PIXI.FlumpLibrary('./exports/animation1');

// start loading library
library.load(function(progress){ console.log('loading', progress * 100); })
	.then(function(library){
		let movie = library.createMovie('cubeAnimation');
		
		stage.addChild(movie);
		
		// plays animation 1 time;
		movie.play(1);
		
		// plays animation 7 times
		movie.play(7);
		
		// plays animation infinite
		movie.play(-1);
		
		// plays animation defined with the label startLabelName once then plays loopLabel infinite
		movie.play(1, 'startLabelName').play(-1, 'loopLabel');
		
		// ends all running animations and starts playing animation with the label startLabelName once when the running animation is done.
		movie.end(true).play(1, 'startLabelName');
	});
	
//see PIXI documentation how this could be done better.
```	
