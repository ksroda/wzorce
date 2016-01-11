var auxiliaryRequire = require('./index_auxiliary.js')();
var databaseRequire = require('./index_database.js');


function GameState(func) {
	this.state = func;
}

GameState.prototype.execute = function(io, room) {
	this.state(io, room);
}

module.exports = (function () {

  var instance;
 
  function init() {
 
   var hangman = {
		rooms: {}
	}

	hangman.createRoom = function(io, roomName, roomIntervals) {
		var room = new Room(roomName, (new Date).getTime())	;
		room.startLoop(io, roomIntervals);
		this.rooms[room.id] = room;
	}

	//-----------------------------------------------------------------Socket---------------------------------------------------

	return hangman;
 
  };
 
  return {
 
    // Get the Singleton instance if one exists
    // or create one if it doesn't
    getInstance: function () {
 
      if ( !instance ) {
        instance = init();
      }
 
      return instance;
    }
 
  };
 
})();


//-------------------------------------------------------------------Room---------------------------------------------------

function Room(roomName, currentTime) {
	this.id 					= "hangman." + roomName;
	this.name 					= roomName;
	this.usersNum 				= 0;
	this.playersAll 			= [];
}


Room.prototype.createPlayer = function(player) {
	player.localPoints = 0;
	player.guessedWord = false

	this.playersAll.push(player);
	if(this.playersAll.length === 1) this.currentPlayer = player;
	this.usersNum += 1;
}

Room.prototype.startLoop = function(io, roomIntervals) {
	var intervalId = auxiliaryRequire.randomId();
	this.interval = intervalId;

	var self = this;
	this.changeState(this.beginning);
	var interval = setInterval(function() {
		// self.gameLoop(io);
	}, 500);
	
	roomIntervals[intervalId] = interval;
}

Room.prototype.changeCurrentPlayer = function(io, player) {
	this.currentPlayer = player;
	this.drawingControlTime = (new Date()).getTime();
	this.changeState(this.beginning);
	io.to(this.id).emit('clear screen');
}

Room.prototype.userDisconnected = function(io, playerId) {
	if(this.currentPlayer.id === playerId) {
		var index = this.playersAll.indexOf(this.currentPlayer);
		index++;
		if(index > this.playersAll.length - 1) {
			index = 0;
		}
		this.changeCurrentPlayer(io, this.playersAll[index]);
	}
}

Room.prototype.findPlayerById = function(id) {
	for(var i = 0; i < this.playersAll.length; i++) {
		if(this.playersAll[i].id == id) {
			return this.playersAll[i];
		};
	}
	return undefined; 
};

Room.prototype.changeState = function(loopState) {
	this.loopState = loopState;
}


Room.prototype.gameLoop = function(io) {
	this.loopState.execute(io, this);

	// io.to(this.id).emit('update', {
	// 	currentWord: this.currentWord,
	// 	currentPlayer: this.currentPlayer,
	// 	timer: this.timer,
	// 	ranking: this.getRanking()
	// });

	if(this.currentWord) console.log("Game state: " + this.state + "    Current word: " + this.currentWord["word"] +
		"   Current player: " + this.currentPlayer.name);
}