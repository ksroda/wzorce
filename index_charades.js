var auxiliaryRequire = require('./index_auxiliary.js');

var charades = {
	rooms: {}
}

charades.createRoom = function(io, roomName, roomsIntervals) {
	var room = new Room(roomName, (new Date).getTime())	
	this.rooms[room.id] = room;
}

//-----------------------------------------------------------------Socket---------------------------------------------------

charades.setOnMouseDown = function(socket) {
	socket.on('mouse down', function(msg) {
		socket.broadcast.to(socket.game + "." + socket.room).emit('mouse down', msg);
	});
};
		
charades.setOnMouseDrag = function(socket) {
	socket.on('mouse drag', function(msg) {
		socket.broadcast.to(socket.game + "." + socket.room).emit('mouse drag', msg);
	});
}

module.exports = charades;

//-------------------------------------------------------------------Room---------------------------------------------------

function Room(roomName, currentTime) {
	this.id 					= "charades." + roomName;
	this.name 					= roomName;
	this.usersNum 				= 0;
	this.playersAll 			= [];
}


Room.prototype.createPlayer = function(player) {
	this.playersAll.push(player);
	this.usersNum += 1;
}