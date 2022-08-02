const width = 800;
const height = 600;

const names = [
  'SupermanSuduction1',
  'SupermanSuduction2',
  'SupermanSuduction3',
  'SupermanDie',
  'SupermanWalk',
  'SupermanSuductionWin',
  'SupermanSuductionLose',
];

const renderer = PIXI.autoDetectRenderer(width, height, {backgroundColor: 0x1099bb});
document.body.appendChild(renderer.view);

// create the root of the scene graph
const stage = new PIXI.Container();

const fl = new PIXI.FlumpLibrary('../test/assets/flump/animation-100/character');


fl.load().then(function(library) {
  for (let i = 0; i < 200; i++) {
    const name = names[Math.floor(Math.random()*names.length)];
    const movie = fl.createMovie(name);
    // console.log(name);

    // let movie = fl.createMovie('cubeAnimation');
    movie.position.set(Math.random() * width|0, Math.random() * height|0);
    movie.play(-1);
    stage.addChild(movie);
  }

  let pTime = 0;
  // start animating
  animate();
  function animate(time) {
    requestAnimationFrame(animate);

    if (!pTime) {
      pTime = time;
    } else {
      const delta = time - pTime;
      pTime = time;


      for (let i = 0; i < stage.children.length; i++) {
        stage.children[i].onTick(delta, delta);
      }
      // render the container
      renderer.render(stage);
    }
  }
}).catch(function(err) {
  console.log(err);
});

