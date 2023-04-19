var canvas;
var backgroundImage, bgImg, car1_img, car2_img, track;
var database, gameState;
var form, player, playerCount, game;
var allPlayers, car1, car2,fuels, powerCoins;
var cars = [];
var fuels,powerCoins,tools;
var obstacle1, obstacle2, obstacle1Image, obstacle2Image;
var blastImage;

function preload() {
  backgroundImage = loadImage("./assets/background.png");
  car1_img = loadImage("./assets/car1.png");
  car2_img = loadImage("./assets/car2.png");
  track = loadImage("./assets/track.jpg");
  powerCoinsImage = loadImage("./assets/goldCoin.png");
  fuelImage = loadImage("./assets/fuel.png");
  lifeImage=loadImage("./assets/life.png");
  obstacle1Image = loadImage("./assets/obstacle1.png");
  obstacle2Image=loadImage("./assets/obstacle2.png");
  blastImage=loadImage("./assets/blast.png");
  toolImage=loadImage("./assets/tool.png");
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  database = firebase.database();
  game = new Game();
  game.getState();
  game.start();
 
}

function draw() {
  background(backgroundImage);
  
  if(playerCount===2){
    game.update(1);
  }

  if (gameState === 1) {
    game.play();
  }

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}