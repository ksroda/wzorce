if(!userAllowedToEnterGame) {
	userAllowedToEnterGame = false;
	window.location = "#/";
} else {

var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render });


//--------------------------------Observer------------------------------------------

var hangmanParts;
var hangmanPartIndex = 1;
var hangman;

var letterCovers;
var letterValues;
var style = { font: "50px Arial", fill: "#FFFFFF", align: "center" };
var styleCurrentPlayer = { font: "30px Arial", fill: "#FFFFFF", align: "center" };


var letters = [];

var currentPlayer;

var newPlayer = true;

function preload() {
  game.load.spritesheet("hangman", "assets/hangman.png", 294, 281, 107);
  game.load.spritesheet("letter", "assets/letter.png", 137, 196, 2);
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
      hangman.animations.play("part0");
      hangmanPartIndex = 1;
    }
    letters = [];
    newPlayer = true;
  }

}));

subject.addObserver(new Observer(function(data) {
  currentPlayer.setText(data.currentPlayer.id !== player.id ? data.currentPlayer.name +"'s turn" : "Your turn");

}));

subject.addObserver(new Observer(function(data) {
  if(newPlayer && data.encryptedWord != "") {
    newPlayer = false;
    letterFactory(data.encryptedWord);

    for(var i = 0; i < data.guessedLetters.length; i++) {
      var id=data.guessedLetters[i].letter;
      $('#'+id).css("background-color", "green").attr("disabled", true);
      for(var j = 0; j < data.guessedLetters[i].positions.length; j++) {
        letters[data.guessedLetters[i].positions[j]].letterValue = id;
        letters[data.guessedLetters[i].positions[j]].letter.setText(id);
        letters[data.guessedLetters[i].positions[j]].update("show");
      }
    }

    for(var i = 0; i < data.wrongLetters.length; i++) {
      var id=data.wrongLetters[i];
      $('#'+id).css("background-color", "red").attr("disabled", true);
      
    }

    hangman.animations.play("part" + data.wrongLetters.length);

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
      .text(room.ranking[i].localPoints === -1 ? "Waiting" : room.ranking[i].localPoints);

    var pencil = $("<span />")
      .attr({ "class": "glyphicon glyphicon-pencil"});

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



function create() {
	// $("canvas").hide();
	game.stage.backgroundColor = 0xF8B346;
  gameLoaded = true;

  hangmanParts = game.add.group();
  letterValues = game.add.group();
  letterCovers = game.add.group();
  hangman = hangmanParts.create(20, window.innerHeight-30, "hangman");

  hangman.anchor.set(0, 1);
  hangman.scale.setTo(1.2, 1.2);

  hangman.animations.add('part0', seq(0, 0), 1, false);
  hangman.animations.add('part1', seq(0, 15), 16, false);
  hangman.animations.add('part2', seq(16, 41), 30, false);
  hangman.animations.add('part3', seq(42, 55), 16, false);
  hangman.animations.add('part4', seq(56, 62), 10, false);
  hangman.animations.add('part5', seq(63, 67), 7, false);
  hangman.animations.add('part6', seq(68, 82), 16, false);
  hangman.animations.add('part7', seq(83, 87), 7, false);
  hangman.animations.add('part8', seq(88, 91), 5, false);
  hangman.animations.add('part9', seq(92, 95), 5, false);
  hangman.animations.add('part10', seq(96, 101), 7, false);
  hangman.animations.add('part11', seq(102, 106), 7, false);
  // hangman.animations.play('part11');

  currentPlayer = game.add.text(window.innerWidth/2,window.innerHeight - 230,"Current player",styleCurrentPlayer);
  currentPlayer.anchor.set(0.5,0.5);
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
	
		var letterWidth = 137 * letterScale;
		var startX = window.innerWidth/2 - word.length/2 * letterWidth + letterWidth/2 * letterScale;

		var counterX = 0;
		var startY = 150;
		var lastSpace = 0;

		for(var i = 0; i < word.length; i++) {
			letters.push(new Letter(word[i], startX + letterWidth * counterX, startY));
			counterX++;
		}
}

}