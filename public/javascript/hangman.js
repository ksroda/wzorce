var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render });


//--------------------------------Observer------------------------------------------

var hangmanParts;
var hangmanPartIndex = 1;
var hangman;

var letterCovers;
var letterValues;
var style = { font: "50px Arial", fill: "#FFFFFF", align: "center" };

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

subject.addObserver(new Observer(function() {

}));


function create() {
	// $("canvas").hide();
	game.stage.backgroundColor = 0xF8B346;
  sendWelcome("testowy"); //Na czas testów
  gameLoaded = true;

  hangmanParts = game.add.group();
  letterValues = game.add.group();
  letterCovers = game.add.group();
  hangman = hangmanParts.create(300, 300, "hangman");

  hangman.anchor.set(0.5, 0.5);
  // hangmanParts.scale.setTo(0.6, 0.6);

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

var letterScale = 0.4;

function Letter(letter, x, y) {
	this.x = x;
	this.y = y;
	
	this.letterValue = letter;
	this.letter = game.add.text(x, y, letter.toUpperCase(), style, letterValues);
	this.letter.anchor.set(0.5, 0.5);

	this.cover = letterCovers.create(x, y, "letter");
	this.cover.anchor.set(0.5, 0.5);
	this.cover.animations.add('show', seq(1, 1), 1, false);
	this.cover.animations.add('hide', seq(0, 0), 1, false);
	this.cover.scale.setTo(letterScale, letterScale);
	this.update("hide");
}

Letter.prototype.update = function(command) {
	this.cover.animations.play(command);
}

function letterFactory(word) {
	var letterWidth = 137 * letterScale;
	var wordBreaker = 15;
	var startX = window.innerWidth/2 - (word.length > wordBreaker ? wordBreaker : word.length)/2 * letterWidth + letterWidth/2 * letterScale;


	var counterX = 0;
	var startY = 120;
	var lastSpace = 0;

	for(var i = 0; i < word.length; i++) {
		if(word[i] !== " ") {
			var letter = new Letter(word[i], startX + letterWidth * counterX, startY);
		} else {
			lastSpace = i;
		}
		counterX++;
		if(counterX > wordBreaker && word[i+1] === " ") {
			counterX = 0;
			startY += 120;
			i++;
		}
	}
}