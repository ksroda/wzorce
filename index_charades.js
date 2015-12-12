var auxiliaryRequire = require('./index_auxiliary.js')();
var databaseRequire = require('./index_database.js');

module.exports = function() {
	var charades = {
		rooms: {}
	}

	charades.createRoom = function(io, roomName, roomIntervals) {
		var room = new Room(roomName, (new Date).getTime())	;
		room.startLoop(io, roomIntervals);
		this.rooms[room.id] = room;
	}

	//-----------------------------------------------------------------Socket---------------------------------------------------

	charades.setOnMouseDown = function(socket) {
		var self = this;
		socket.on('mouse down', function(msg) {
			socket.broadcast.to(socket.roomId).emit('mouse down', msg);
		});
	};
			
	charades.setOnMouseDrag = function(socket) {
		var self = this;
		socket.on('mouse drag', function(msg) {
			socket.broadcast.to(socket.roomId).emit('mouse drag', msg);
		});
	}

	charades.setOnChatMessage = function(io, socket) {
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

	return charades;
};

//-------------------------------------------------------------------Room---------------------------------------------------

function Room(roomName, currentTime) {
	this.id 					= "charades." + roomName;
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
	this.state = "beginning";
	io.to(this.id).emit('clear screen');
}

Room.prototype.userDisconnected = function(io, playerId) {
	if(this.currentPlayer.id === playerId) {
		this.changeCurrentPlayer(io, this.playersAll[Math.floor(Math.random() * this.playersAll.length)]);
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

Room.prototype.gameLoop = function(io) {
	var now = (new Date()).getTime();
	switch(this.state) {
		case "beginning":
			this.setRandomWord();
			this.drawingControlTime = (new Date()).getTime();
  			this.state = "drawing time";
			break;
		case "drawing time":
			this.playersAll.forEach(function(player) {
				if(player.guessedWord) {
					this.currentPlayer = player;
					player.localPoints += this.pointsForWin;
					player.overallPoints += this.pointsForWin;
					io.to(this.id).emit("player who won", {
						player: player,
						currentWord: this.currentWord
					});
					this.afterGameControlTime = now;
					this.state = "after game";
				}
			});
			this.timer = Math.ceil((this.drawingTime - (now - this.drawingControlTime))/1000);
			if(now - this.drawingControlTime > this.drawingTime) {
				this.changeCurrentPlayer(io, this.playersAll[Math.floor(Math.random() * this.playersAll.length)]);
			}
			break;
		case "after game":
			//if(now - this.afterGameControlTime > this.afterGameTime) {
			//	this.afterGameControlTime = now;
				this.playersAll.forEach(function(player) {
					player.guessedWord = false;
				})
				this.state = "beginning";
			//}
			break;
	}

	io.to(this.id).emit('update', {
		room: this,
	});

	if(this.currentWord) console.log("Game state: " + this.state + "    Current word: " + this.currentWord["word"] +
		"   Current player: " + this.currentPlayer.name);
}