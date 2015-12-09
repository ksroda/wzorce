var auxiliaryRequire = require('./index_auxiliary.js')();

module.exports = function() {

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
				overallPoints: 1000,
				inGame: true
			}

			games[socket.game].rooms[socket.roomId].createPlayer(player);
			io.emit('update rooms', games[socket.game].rooms);
		});
	};

	var publicSetOnDisconnect = function(socket, games, io, roomsIntervals) {
		socket.on('disconnect', function() {
			if(socket.game) {
				games[socket.game].rooms[socket.roomId].usersNum--;
					
				for(var i = 0; i < games[socket.game].rooms[socket.roomId].playersAll.length; i++) {
					if(games[socket.game].rooms[socket.roomId].playersAll[i].id === socket.id) {
						games[socket.game].rooms[socket.roomId].playersAll.splice(i, 1);
						break;
					}
				}
			
				if(games[socket.game].rooms[socket.roomId].usersNum <= 0) {
					clearInterval(roomsIntervals[games[socket.game].rooms[socket.roomId].interval]);
					delete games[socket.game].rooms[socket.roomId];
				} else {
					io.to(socket.roomId).emit('player disconnected', socket.id);
					games[socket.game].rooms[socket.roomId].userDisconnected(io, socket.id);
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
}