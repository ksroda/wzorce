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
 
   var pictionary = {
		rooms: {}
	}

	pictionary.createRoom = function(io, roomName, roomIntervals) {
		var room = new Room(roomName, (new Date).getTime())	;
		room.startLoop(io, roomIntervals);
		this.rooms[room.id] = room;
	}

	//-----------------------------------------------------------------Socket---------------------------------------------------

	pictionary.setOnMouseDown = function(socket) {
		var self = this;
		socket.on('mouse down', function(msg) {
			socket.broadcast.to(socket.roomId).emit('mouse down', msg);
		});
	};
			
	pictionary.setOnMouseDrag = function(socket) {
		var self = this;
		socket.on('mouse drag', function(msg) {
			socket.broadcast.to(socket.roomId).emit('mouse drag', msg);
		});
	}

	pictionary.setOnChatMessage = function(io, socket) {
		var self = this;
		socket.on('chat-message', function(msg) {
			var currentPlayer = self.rooms[socket.roomId].currentPlayer;
			if(currentPlayer.id != socket.id) {
				io.to(socket.roomId).emit('chat-message', msg);

				var correctnessResult = auxiliaryRequire.correctness(msg.content, self.rooms[socket.roomId].currentWord.word);
				if(correctnessResult === 2) {
					io.to(socket.roomId).emit('chat-message', {
						sender: "System",
						content: "Congratulations! The winner is " + socket.name
					});
					self.rooms[socket.roomId].playersAll.forEach(function(player) {
						if(player.id === socket.id) {
							player.localPoints += 100;
							console.log(player.overallPoints + "   " + (player.overallPoints + 100))
							player.overallPoints += 100;
							self.rooms[socket.roomId].changeCurrentPlayer(io, player);
						}
					})
				} else if(correctnessResult === 1) {
					io.to(socket.roomId).emit('chat-message', {
						sender: "System",
						content: msg.content + " - Really close!"
					});
				}
			}
		});
	}

	return pictionary;
 
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
	this.id 					= "pictionary." + roomName;
	this.name 					= roomName;
	this.usersNum 				= 0;
	this.playersAll 			= [];
	this.state					= "beginning";
	this.drawingControlTime		= currentTime;
	this.drawingTime 			= 60000;
	this.afterGameControlTime 	= currentTime;
	this.afterGameTime 			= 0;
	this.pointsForWin			= 100;
	this.currentPlayer			= 0;
	this.timer 					= 0;
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
		self.gameLoop(io);
	}, 500);
	
	roomIntervals[intervalId] = interval;
}

Room.prototype.setRandomWord = function() {
	databaseRequire.setRandomWord(this);
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

Room.prototype.getRanking = function() {
	return this.playersAll.sort(function(a,b) {
		return b.localPoints - a.localPoints
	});
};

Room.prototype.changeState = function(loopState) {
	this.loopState = loopState;
}

Room.prototype.beginning = new GameState(function(io, room) {
	var now = (new Date()).getTime();
	room.state = "beginning";
	room.setRandomWord();
	room.drawingControlTime = (new Date()).getTime();
  	room.changeState(room.drawing);
});

Room.prototype.drawing = new GameState(function(io, room) {
	var now = (new Date()).getTime();
	room.state = "drawing time";
	room.playersAll.forEach(function(player) {
	if(player.guessedWord) {
		room.currentPlayer = player;
			player.localPoints += room.pointsForWin;
			player.overallPoints += room.pointsForWin;
			io.to(room.id).emit("player who won", {
			player: player,
			currentWord: room.currentWord
		});
		room.afterGameControlTime = now;
		room.changeState(room.afterGame);
	}
	});
	room.timer = Math.ceil((room.drawingTime - (now - room.drawingControlTime))/1000);
	if(now - room.drawingControlTime > room.drawingTime) {
		room.changeCurrentPlayer(io, room.playersAll[Math.floor(Math.random() * room.playersAll.length)]);
	}
});

Room.prototype.afterGame = new GameState(function(io, room) {
	var now = (new Date()).getTime();
	room.state = "after game";
	//if(now - room.afterGameControlTime > room.afterGameTime) {
			//	room.afterGameControlTime = now;
				room.playersAll.forEach(function(player) {
					player.guessedWord = false;
				})
				room.changeState(room.beginning);
			//}
});

Room.prototype.gameLoop = function(io) {
	this.loopState.execute(io, this);

	io.to(this.id).emit('update', {
		currentWord: this.currentWord,
		currentPlayer: this.currentPlayer,
		timer: this.timer,
		ranking: this.getRanking()
	});

	if(this.currentWord) console.log("Game state: " + this.state + "    Current word: " + this.currentWord["word"] +
		"   Current player: " + this.currentPlayer.name);
}