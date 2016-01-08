var auxiliaryRequire = require('./index_auxiliary.js')();
var databaseRequire = require('./index_database.js');

module.exports = (function() {

	var publicSetOnWelcome = function(socket, games, io, roomsIntervals) {
		socket.on('welcome', function(user) {
			socket.name = user.name;
			socket.room = user.room;
			socket.game = user.game;
			socket.roomId = socket.game + "." + socket.room;

			socket.join(socket.roomId);
			
			if(!games[socket.game].rooms[socket.roomId]) {
				games[socket.game].createRoom(io, socket.room, roomsIntervals);
			}
			
			var player = {
				id: socket.id,
				name: socket.name,
				room: socket.room,
				roomId: socket.roomId,
				overallPoints: user.overallPoints,
				inGame: true
			}

			games[socket.game].rooms[socket.roomId].createPlayer(player);
			socket.broadcast.emit('update rooms', games[socket.game].rooms);
		});
	};

	var publicSetOnDisconnect = function(socket, games, io, roomsIntervals) {
		socket.on('disconnect', function() {
			if(socket.game) {
				var room = games[socket.game].rooms[socket.roomId];
				databaseRequire.updateUserStatistics(room.findPlayerById(socket.id), socket.startTime);
				room.usersNum--;

				if(room.usersNum <= 0) {
					clearInterval(roomsIntervals[room.interval]);
					delete games[socket.game].rooms[socket.roomId];
				} else {
					io.to(socket.roomId).emit('player disconnected', socket.id);
					room.userDisconnected(io, socket.id);
	
					for(var i = 0; i < room.playersAll.length; i++) {
						if(room.playersAll[i].id === socket.id) {
							room.playersAll.splice(i, 1);
							break;
						}
					}
				}
			
				io.emit('update rooms', games[socket.game].rooms);
			}
		});
	};

	var publicSetOnMessage = function(socket, io) {
		socket.on('message', function(msg) {
				io.to(socket.roomId).emit('message', msg);
		});
	};

	return {
		setOnWelcome: publicSetOnWelcome,
		setOnDisconnect: publicSetOnDisconnect,
		setOnMessage: publicSetOnMessage
	}
})();