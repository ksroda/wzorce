var auxiliaryRequire = require('./index_auxiliary.js');
var databaseRequire = require('./index_database.js');

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
		var currentPlayer = self.rooms[socket.roomId].currentPlayer;
		if(currentPlayer.id = socket.id) {
			socket.broadcast.to(socket.roomId).emit('mouse down', msg);
		}
	});
};
		
charades.setOnMouseDrag = function(socket) {
	var self = this;
	socket.on('mouse drag', function(msg) {
		var currentPlayer = self.rooms[socket.roomId].currentPlayer;
		if(currentPlayer.id = socket.id) {
			socket.broadcast.to(socket.roomId).emit('mouse drag', msg);
		}
	});
}

module.exports = charades;

//-------------------------------------------------------------------Room---------------------------------------------------

function Room(roomName, currentTime) {
	this.id 					= "charades." + roomName;
	this.name 					= roomName;
	this.usersNum 				= 0;
	this.playersAll 			= [];
	this.state					= "beginning";
	this.drawingControlTime		= currentTime;
	this.drawingTime 			= 5000;
	this.afterGameControlTime 	= currentTime;
	this.afterGameTime 			= 3000;
	this.pointsForWin			= 100;
	this.currentPlayer			= 0;
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
	}, 100);
	
	roomIntervals[intervalId] = interval;
	//this.setRandomWord();
}

Room.prototype.setRandomWord = function() {
	databaseRequire.setRandomWord(this);
}

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
			if(now - this.drawingControlTime > this.drawingTime) {
				this.drawingControlTime = now;
				this.currentPlayer = this.playersAll[Math.floor(Math.random() * this.playersAll.length)];
				this.state = "beginning";
			}
			break;
		case "after game":
			if(now - this.afterGameControlTime > this.afterGameTime) {
				this.afterGameControlTime = now;
				this.playersAll.forEach(function(player) {
					player.guessedWord = false;
				})
				this.state = "beginning";
			}
			break;
	}
	if(this.currentWord) console.log("Game state: " + this.state + "    Current word: " + this.currentWord["word"] +
		"   Current player: " + this.currentPlayer.name);
}