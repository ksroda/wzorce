if(!userAllowedToEnterGame) {
	userAllowedToEnterGame = false;
	window.location = "/hangman";
} else {

var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, 'phaser', { preload: preload, create: create });


//--------------------------------Observer------------------------------------------

var hangmanParts;
var hangman;

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
	game.load.spritesheet("hangman", "assets/hangman.png", 294, 281, 107);
	game.load.spritesheet("letter", "assets/letter.png", 137, 196, 2);
	game.load.start();
}

var subject = new Subject();

subject.addObserver(new Observer(function(data) {
  if (data.state == "reset"){
    for(var i = 0; i < letters.length; i++){
      letters[i].letter.kill();
      if(letters[i].cover) letters[i].cover.kill();
   		hangman.animations.play("part0");
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
      var id = data.wrongLetters[i];
      $('#' + id).css("background-color", "red").attr("disabled", true); 
    }

    if(data.wrongLetters.length > 0) {
    	hangman.animations.play("part" + data.wrongLetters.length);
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

	hangman = hangmanParts.create(20, window.innerHeight-30, "hangman");
 
   hangman.anchor.set(0, 1);
   hangman.scale.setTo(1.2, 1.2);

 	var fps = 30;
   hangman.animations.add('part0', seq(0, 0), 1, false);
   hangman.animations.add('part1', seq(0, 16), fps, false);
   hangman.animations.add('part2', seq(17, 42), fps, false);
   hangman.animations.add('part3', seq(43, 56), fps, false);
   hangman.animations.add('part4', seq(57, 62), fps, false);
   hangman.animations.add('part5', seq(63, 67), fps, false);
   hangman.animations.add('part6', seq(68, 82), fps, false);
   hangman.animations.add('part7', seq(83, 87), fps, false);
   hangman.animations.add('part8', seq(88, 91), fps, false);
   hangman.animations.add('part9', seq(92, 95), fps, false);
   hangman.animations.add('part10', seq(96, 101), fps, false);
   hangman.animations.add('part11', seq(102, 106), fps, false);

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