if(!userAllowedToEnterGame) {
	userAllowedToEnterGame = false;
	window.location = "#/";
} else {

//---------------------------------Phaser-------------------------------------------
var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, 'phaser', { create: create, update: update, render: render });

var graphics;
var draw= false;
var i  = 0;
var lastX;
var lastY;
var length = 2;
var currentWord;
var currentCategory;
var iAmDrawing;
var whoIsDrawing;
var timer;


//--------------------------------Observer------------------------------------------
function Observer(func) {
  this.update = func;
}

function ObserverList(){
  this.observerList = [];
}
 
ObserverList.prototype.add = function(obj){
  return this.observerList.push( obj );
};
 
ObserverList.prototype.count = function(){
  return this.observerList.length;
};
 
ObserverList.prototype.get = function(index){
  if( index > -1 && index < this.observerList.length ){
    return this.observerList[ index ];
  }
};
 
ObserverList.prototype.indexOf = function(obj, startIndex){
  var i = startIndex;
 
  while( i < this.observerList.length ){
    if( this.observerList[i] === obj ){
      return i;
    }
    i++;
  }
 
  return -1;
};
 
ObserverList.prototype.removeAt = function(index){
  this.observerList.splice( index, 1 );
};


function Subject(){
  this.observers = new ObserverList();
}
 
Subject.prototype.addObserver = function(observer){
  this.observers.add( observer );
};
 
Subject.prototype.removeObserver = function(observer){
  this.observers.removeAt( this.observers.indexOf( observer, 0 ) );
};
 
Subject.prototype.notify = function(context){
  var observerCount = this.observers.count();
  for(var i = 0; i < observerCount; i++){
    this.observers.get(i).update(context);
  }
};

var subject = new Subject();

subject.addObserver(new Observer(function(room) {
	if(room.currentWord) {
		currentCategory.text = "Category: " + room.currentWord.category;
		currentWord.text = (room.currentPlayer.name == player.name) ? "Word: " + room.currentWord.word : "";
	}
	whoIsDrawing.text = (room.currentPlayer.name == player.name) ? "You are drawing" : room.currentPlayer.name + " is drawing";
	timer.text = room.timer;
	iAmDrawing = (room.currentPlayer.name == player.name);
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
			.text(room.ranking[i].localPoints);

		var pencil = $("<span />")
			.attr({ "class": "glyphicon glyphicon-pencil"});

		var divPencil = $("<div />")
			.attr({ "class": "pencil col-sm-1"});

		if(room.ranking[i].name == room.currentPlayer.name) {
			divPencil.append(pencil);
		} 

		liDiv.append(divPosition).append(divName).append(divPoints).append(divPencil);
		li.append(liDiv);
		rankingUl.append(li);
	}
}));


function create() {
	// $("canvas").hide();
	game.stage.backgroundColor = 0xfdf5d6;
    graphics = game.add.graphics(0, 0);


    game.input.onDown.add(onDown, this);
    game.input.onUp.add(onUp, this);
    game.input.addMoveCallback(trace, this);

    var style = { font: "30px Arial", fill: "black", align: "center" };

    whoIsDrawing = game.add.text(40, 70, "", style);
    currentCategory = game.add.text(40, 105, "Category:", style);
    currentWord = game.add.text(40, 140, "", style);
    
    timer = game.add.text(window.innerWidth - 420, 70, "", style);
    gameLoaded = true;

    //sendWelcome("testowy"); //Na czas testów
}


function onDown(pointer) {
	if(iAmDrawing) {
		graphics.lineStyle(player.pathProperties.size, player.pathProperties.color, 1);
		graphics.moveTo(pointer.x, pointer.y);
		draw = true;
		lastX = pointer.x;
		lastY = pointer.y;
		socket.emit('mouse down', {
			start: {
				x: pointer.x,
				y: pointer.y
			}, 
			size: player.pathProperties.size,
			color: player.pathProperties.color
		});
	}
}


function onUp(pointer) {
	draw = false;
}


function trace(pointer) {
    if (draw && (Math.abs(pointer.x - lastX) > length || Math.abs(pointer.y - lastY) > length) && iAmDrawing) {
      	graphics.lineTo(pointer.x, pointer.y);
		console.log(i++);
		lastX = pointer.x;
		lastY = pointer.y;
		socket.emit('mouse drag', {
			x: pointer.x,
			y: pointer.y
		})
    }
}

function update() {

}

function render() {


}

//----------------------------------JQuery-----------------------------------------
$(document).ready(function() {
	$("#right-container #chat #input-chat #message input").keypress(function(e){
		if(e.which == 13) {
			$("#right-container #chat #input-chat #send-button button").click();
		}
    });
});

};