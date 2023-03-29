class Game {
  constructor() {
    this.resetTitle=createElement("h2");
    this.resetButton=createButton("");
    this.leaderboardTitle=createElement("h2");
    this.leader1=createElement("h2");
    this.leader2=createElement("h2");
    this.playermoving=false;
    this.leftKeyActive = false;
    this.blast = false;
  }
  getState() { 
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function(data) {
      gameState = data.val();
    });
  }

  update(state) {
    database.ref("/").update({
      gameState: state
    });
  }

  start() {
    player = new Player();
    playerCount = player.getCount();

    form = new Form();
    form.display();

    car1 = createSprite(width / 2 - 50, height - 100);
    car1.addImage("car1", car1_img);
    car1.scale = 0.07;
    car1.addImage("blast", blastImage);

    car2 = createSprite(width / 2 + 100, height - 100);
    car2.addImage("car2", car2_img);
    car2.scale = 0.07;
    car2.addImage("blast", blastImage);


    cars = [car1, car2];

    fuels = new Group ();
    powerCoins = new Group ();
    tools = new Group();
    obstacle1 = new Group();
    obstacle2 = new Group();

    var obstacle1Positions = [
      {x: width/2-150, y:height-1300, image:obstacle1Image},
      {x: width/2+250, y:height-1800, image:obstacle1Image},
      {x: width/2-180, y:height-3300, image:obstacle1Image},

      {x: width/2-150, y:height-4300, image:obstacle1Image},
      {x: width/2, y:height-5300, image:obstacle1Image},
    ];

    var obstacle2Positions = [
      {x: width/2+250, y:height-800, image:obstacle2Image},
      {x: width/2-180, y:height-2300, image:obstacle2Image},
      {x: width/2, y:height-2800, image:obstacle2Image},

      {x: width/2+180, y:height-3300, image:obstacle2Image},
      {x: width/2+250, y:height-3800, image:obstacle2Image},
      {x: width/2+250, y:height-4800, image:obstacle2Image},
      {x: width/2-180, y:height-5500, image:obstacle2Image}
    ];

    this.addSprites(fuels,4,fuelImage,0.02);
    this.addSprites(powerCoins,20,powerCoinsImage,0.09);
    this.addSprites(tools,8,toolImage,0.07);
    this.addSprites(obstacle1, obstacle1Positions.length, obstacle1Image, 0.04, obstacle1Positions);
    this.addSprites(obstacle2, obstacle2Positions.length, obstacle2Image, 0.04, obstacle2Positions);
  }

  addSprites(spriteGroup,numberOfSprites,spriteImage,scale, positions=[]){
    for (var i=0; i<numberOfSprites;i++){
      var x,y;
      if(position.length>0){
        x = positions[i].x;
        y = positions[i].y;
        spriteImage=positions[i].image;
      } else{
      x=random(width/2+150,width/2-150);
      y=random(-height*4.5,height-400);

      var sprite=createSprite(x,y);
      sprite.addImage("sprite",spriteImage);
      sprite.scale=scale;
      spriteGroup.add(sprite);
      }
    }
  }

  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");
    this.resetTitle.html("Reiniciar Juegoo");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width/2+200, 40);

    this.resetButton.class("resetButton");
    this.resetButton.position(width/2+250, 100);

    this.leaderboardTitle.html("Tabla de Puntuación");
    this.leaderboardTitle.class("resetText");
    this.leaderboardTitle.position(width/3-60, 40);

    this.leader1.class("leadersText");
    this.leader1.position(width/3-50,80);

    this.leader2.class("leadersText");
    this.leader2.position(width/3-50,130);
  }

  play() {
    this.handleElements();
    this.handleResetButton();
    Player.getPlayersInfo(); 
    Player.getCarsAtEnd();

    if (allPlayers !== undefined) {
      image(track, 0, -height * 5, width, height * 6);

      this.showLife();
      this.showFuelBar();
      this.showLeaderboard();

      var index = 0;
      for (var plr in allPlayers) {
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;

        var currentLife=allPlayers[plr].life

        if(currentLife<=0){
          cars[index-1].changeImage("blast");
          cars[index-1].scale=0.3;
        }

        cars[index].position.x = x;
        cars[index].position.y = y;
        index = index + 1;
      }

      if(index===player.index){
        stroke(10);
        fill ("red");
        ellipse (x,y,60,60);

        this.handleFuel(index);
        this.handlPowerCoins(index);
        this.handleObstaclesCollision(index);

        camera.position.x=width/2;
        camera.position.y=cars[indx-1].position.y;

        if(player.life<=0){
          this.playermoving=false;
          this.blast=true;
          gameState=2;
          this.gameOver();
        }
      }

      if (keyIsDown(UP_ARROW)) {
        player.positionY += 10;
        player.update();
      }


      if(this.playermoving){
        player.positionY+=5;
        player.update();
      }

      this.handlePlayerControls();

      const finishLine = height*6-100;

      if(player.positionY>finishLine){
        gameState = 2;
        player.rank +=1;
        Player.updateCarsAtEnd(player.rank);
        player.update();
        this.showRank();
      }
 
      drawSprites();
    }
  }

  handleTools(index){
    cars[index-1].overlap(tools,function(collector, collected){
      player.life+=15;
      collected.remove();
    }); 

  handleFuel(index){
    cars[index-1].overlap(fuels,function(collector, collected){
      player.fuel=185;
      collected.remove();
    }); 
    if(player.fuel>0 && this.playermoving){
      player.fuel -=0.5;
    }

    if(player.fuel <= 0){
      gameState=2;
      this.gameOver;
    }
  }

  handlPowerCoins(index){
    cars[index-1].overlap(powerCoins,function(collector, collected){
      player.score += 21;
      player.update();
      collected.remove();
    }); 
  }

  handleResetButton(){
    this.resetButton.mousePressed(()=>{
      database.ref("/").set({
        playerCount:0,
        gamestate:0,
        players:{}
      });
    });
    window.location.reload();
  }

  handlePlayerControls(){
    if(!this.blast){
    if(keyIsDown(RIGHT_ARROW)){
      this.leftKeyActive=false;
      player.positionX += 7;
      player.update();
    }

    if(keyIsDown(LEFT_ARROW)){
      this.leftKeyActive=true;
      player.positionX -= 7;
      player.update();
    }

    if(keyIsDown(UP_ARROW)){
      this.playermoving=true;
      player.positionY +=7;
      player.update();
    }

    if(keyIsDown(DOWN_ARROW)){
      player.positionY -=7;
      player.update();
    }
   }
  }

  showLeaderboard(){
    var leader1, leader2;
    var players=Object.values(allPlayers);
    if (
      (players[0].rank===0 && players[1].rank===0) ||
      players[0].rank===1
    ){
      leader1=
        players[0].rank +
        "&EMSP;" +
        players[0].name +
        "&emps;" +
        players[0].score;

        leader2=
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emps;" +
        players[1].score;
    }
    if(players[1].rank===1){
      leader1=
      players[1].rank +
      "&emsp;" +
      players[1].name +
      "&emps;" +
      players[1].score;

      leader2=
      players[0].rank +
      "&emsp;" +
      players[0].name +
      "&emps;" +
      players[0].score;
    }
    this.leader1.html(leader1);
    this.leader2.html(leader2);
  }

  showRank(){
    swal({
    title: `¡Impresionante!${"\n"}${player.rank}`.
    text: "Cruzaste la línea de meta con exito",
    imageUrl:
    "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
    imageSize:"100x100",
    confirmButtonText: "Ok"
    });
  }

  showLife(){
    push()
    image(lifeImage, width/2-130, height-player.positionY-200, 20, 20);
    fill("white");
    rect(width/2-100, height-player.positionY-200, 185, 20);
    fill("red");
    rect(width/2-100, height-player.positionY-200, player.life, 20);
    noStroke();
    pop();
  }

  showFuelBar(){
    push()
    image(fuelImage, width/2-130, height-player.positionY-100, 20, 20);
    fill("white");
    rect(width/2-100, height-player.positionY-100, 185, 20);
    fill("yellow");
    rect(width/2-100, height-player.positionY-100, player.fuel, 20);
    noStroke();
    pop()
  }

  gameOver(){
    swal({
      title: `Fin del Juego`,
      text: "¡Ups! ¡Perdiste la Carrera!",
      imageUrl:
      "https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png",
      imageSize: "100x100",
      confirmButtonText:"Gracias por Jugar"
    });
  }

  handleObstaclesCollision(index){
    if(cars[index-1].collide(obstacle1)){
      if(player.life>0){
        if(this.leftKeyActive){
          player.positionX += 100;
        }
        else{
          player.positionX -= 100;
        }
        player.life -= 185/4;
      }
      player.update();
    }
    if(player.life<=0){
      gameState = 2;
      this.gameOver();
    }
  }
}