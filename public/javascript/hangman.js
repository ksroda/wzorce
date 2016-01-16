if(!userAllowedToEnterGame) {
	userAllowedToEnterGame = false;
	window.location = "#/";
} else {

var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, 'phaser', { preload: preload, create: create });


//--------------------------------Observer------------------------------------------

var hangmanParts;
var hangmanPartIndex = 1;
var hangman = {};

var letterCovers;
var letterValues;
var style = { font: "40px Arial", fill: "#FFFFFF", align: "center" };
var styleCurrentPlayer = { font: "30px Arial", fill: "#FFFFFF", align: "center" };

var wordCategory;
var letters = [];

var currentPlayer;

var newPlayer = true;

var loadingText;

var timer;

function startLoading() {
	game.load.spritesheet("part1", "assets/part1.png", 490, 468, 39);
	game.load.spritesheet("part2", "assets/part2.png", 490, 468, 60);
	game.load.spritesheet("part3", "assets/part3.png", 490, 468, 33);
	game.load.spritesheet("part4", "assets/part4.png", 490, 468, 14);
	game.load.spritesheet("part5", "assets/part5.png", 490, 468, 13);
	game.load.spritesheet("part6", "assets/part6.png", 490, 468, 34);
	game.load.spritesheet("part7", "assets/part7.png", 490, 468, 11);
	game.load.spritesheet("part8", "assets/part8.png", 490, 468, 9);
	game.load.spritesheet("part9", "assets/part9.png", 490, 468, 11);
	game.load.spritesheet("part10", "assets/part10.png", 490, 468, 14);
	game.load.spritesheet("part11", "assets/part11.png", 490, 468, 12);

	// game.load.spritesheet("hangman", "assets/hangman.png", 294, 281, 107);
	game.load.spritesheet("letter", "assets/letter.png", 137, 196, 2);
	game.load.start();
}

function Observer(func) {
  this.update = func;
}

function ObserverList(){
  this.observerList = [];
}
 
ObserverList.prototype.add = function( obj ){
  return this.observerList.push( obj );
};
 
ObserverList.prototype.count = function(){
  return this.observerList.length;
};
 
ObserverList.prototype.get = function( index ){
  if( index > -1 && index < this.observerList.length ){
    return this.observerList[ index ];
  }
};
 
ObserverList.prototype.indexOf = function( obj, startIndex ){
  var i = startIndex;
 
  while( i < this.observerList.length ){
    if( this.observerList[i] === obj ){
      return i;
    }
    i++;
  }
 
  return -1;
};
 
ObserverList.prototype.removeAt = function( index ){
  this.observerList.splice( index, 1 );
};


function Subject(){
  this.observers = new ObserverList();
}
 
Subject.prototype.addObserver = function( observer ){
  this.observers.add( observer );
};
 
Subject.prototype.removeObserver = function( observer ){
  this.observers.removeAt( this.observers.indexOf( observer, 0 ) );
};
 
Subject.prototype.notify = function( context ){
  var observerCount = this.observers.count();
  for(var i=0; i < observerCount; i++){
    this.observers.get(i).update( context );
  }
};


var subject = new Subject();

subject.addObserver(new Observer(function(data) {
  if (data.state == "reset"){
    for(var i=0; i<letters.length; i++){
      letters[i].letter.kill();
      if(letters[i].cover) letters[i].cover.kill();
      for (var x in hangman) {
    	hangman[x].visible = false;
   		}
      // hangman.animations.play("part0");

      hangmanPartIndex = 1;
    }
    letters = [];
    newPlayer = true;
  }

}));

subject.addObserver(new Observer(function(data) {
  currentPlayer.setText(data.currentPlayer.id !== player.id ? data.currentPlayer.name +"'s turn" : "Your turn");
  wordCategory.setText("Category: " + data.wordCategory);
  timer.setText(data.timer);
}));

subject.addObserver(new Observer(function(data) {
  if(newPlayer && data.encryptedWord != "") {
    newPlayer = false;
    letterFactory(data.encryptedWord);

    for(var i = 0; i < data.guessedLetters.length; i++) {
      var id=data.guessedLetters[i].letter;
      $('#'+id).css("background-color", "green").attr("disabled", true);
      for(var j = 0; j < data.guessedLetters[i].positions.length; j++) {
        letters[data.guessedLetters[i].positions[j]].letterValue = id.toUpperCase();
        letters[data.guessedLetters[i].positions[j]].letter.setText(id.toUpperCase());
        letters[data.guessedLetters[i].positions[j]].update("show");
      }
    }

    for(var i = 0; i < data.wrongLetters.length; i++) {
      var id=data.wrongLetters[i];
      $('#'+id).css("background-color", "red").attr("disabled", true);
      
    }

    for (var x in hangman) {
    	if(x === data.wrongLetters.length) {
    		hangman[x].visible = true;
    	} else {
    		hangman[x].visible = false;
    	}
    }

    if(data.wrongLetters.length > 0) {
    	// hangman[data.wrongLetters.length].visible = true;
    	hangman[data.wrongLetters.length].animations.play("go");
    }
  }

}));


subject.addObserver(new Observer(function(room) {
  var rankingUl = $("#right-container-ranking #ranking #ranking-table-content ul");
  rankingUl.html("");

  for(var i = 0; i < room.ranking.length; i++) {
    var li = $( "<li />" );
    var liDiv = $("<div />")
      .attr({ "class": "row" });

    var divPosition = $("<div />")
      .attr({ "class": "position col-sm-1"})
      .text(i+1);

    var divName = $("<div />")
      .attr({ "class": "name col-sm-6"})
      .text(room.ranking[i].name);

    var divPoints = $("<div />")
      .attr({ "class": "points col-sm-3"})
      .text(room.ranking[i].waiting === true ? "Waiting" : room.ranking[i].localPoints);

    var pencil = $("<span />")
      .attr({ "class": "glyphicon glyphicon-chevron-left"});

    var divPencil = $("<div />")
      .attr({ "class": "pencil col-sm-1"});

    if(room.ranking[i].id == room.currentPlayer.id) {
      divPencil.append(pencil);
    } 

    liDiv.append(divPosition).append(divName).append(divPoints).append(divPencil);
    li.append(liDiv);
    rankingUl.append(li);
  }
}));

function preload() {

}

function create() {
	game.stage.backgroundColor = 0xF8B346;
	var style = { font: "30px Arial", fill: "#FFFFFF", align: "center" };
	loadingText = game.add.text(window.innerWidth/2, window.innerHeight/2, "Loading...", style);
	loadingText.anchor.set(0.5, 0.5);
	game.load.onLoadComplete.add(loadComplete, this);
	startLoading();
}



function loadComplete() {
	loadingText.setText("");
	$(".letterButtons").fadeIn();
	$("#right-container-ranking").fadeIn();
	hangmanParts = game.add.group();
	letterValues = game.add.group();
	letterCovers = game.add.group();

	for(var i = 1 ; i <= 11; i++) {
		hangman[i] = hangmanParts.create(20, window.innerHeight-30, "part" + i);
		hangman[i].anchor.set(0, 1);
		hangman[i].scale.setTo(0.8, 0.8);
		hangman[i].visible = false;
	}

  var fps = 60;
  hangman[1].animations.add('go', seq(0, 38), fps, false);
  hangman[2].animations.add('go', seq(0, 59), fps, false);
  hangman[3].animations.add('go', seq(0, 32), fps, false);
  hangman[4].animations.add('go', seq(0, 13), fps, false);
  hangman[5].animations.add('go', seq(0, 12), fps, false);
  hangman[6].animations.add('go', seq(0, 33), fps, false);
  hangman[7].animations.add('go', seq(0, 10), fps, false);
  hangman[8].animations.add('go', seq(0, 8), fps, false);
  hangman[9].animations.add('go', seq(0, 10), fps, false);
  hangman[10].animations.add('go', seq(0, 13), fps, false);
  hangman[11].animations.add('go', seq(0, 11), fps, false);

  currentPlayer = game.add.text(window.innerWidth/2, window.innerHeight - 230,"Current player",styleCurrentPlayer);
  currentPlayer.anchor.set(0.5,0.5);

  wordCategory = game.add.text(window.innerWidth/2, 100,"Category", styleCurrentPlayer);
  wordCategory.anchor.set(0.5,0.5);

	timer = game.add.text(window.innerWidth/2 + 235, window.innerHeight - 230, "", styleCurrentPlayer);
	timer.anchor.set(0.5, 0.5);
  gameLoaded = true;
}

function seq(from, to) {
	var result = [];
	for(var i = from; i <= to; i++) {
		result.push(i);
	}
	return result;
}

function update() {

}

function render() {

}

var letterScale = 0.3;

function Letter(letter, x, y) {
	this.x = x;
	this.y = y;
	
	this.letterValue = letter;
	this.letter = game.add.text(x, y, letter, style, letterValues);
	this.letter.anchor.set(0.5, 0.5);

  if(letter !== " ") {
    this.cover = letterCovers.create(x, y, "letter");
    this.cover.anchor.set(0.5, 0.5);
    this.cover.animations.add('show', seq(1, 1), 1, false);
    this.cover.animations.add('hide', seq(0, 0), 1, false);
    this.cover.scale.setTo(letterScale, letterScale);
    this.update("hide");
  }
	
}

Letter.prototype.update = function(command) {
	this.cover.animations.play(command);
}

function letterFactory(word) {
	var additionalScale = 1.1;
	var letterWidth = 137 * letterScale;

	do {
		additionalScale -= 0.1;
		letterWidth = 137 * letterScale * additionalScale;
	} while(word.length * letterWidth > window.innerWidth);

	letterWidth = 137 * letterScale * additionalScale;
	var startX = window.innerWidth/2 - word.length/2 * letterWidth + letterWidth/2 * letterScale;
	var startY = 150;

	for(var i = 0; i < word.length; i++) {
		letters.push(new Letter(word[i], startX + letterWidth * i, startY));
	}
}



}