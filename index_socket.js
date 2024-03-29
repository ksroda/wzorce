var auxiliaryRequire = require('./index_auxiliary.js')();
var databaseRequire = require('./index_database.js');

module.exports = (function() {

	var publicSetOnWelcome = function(socket, games, io, roomsIntervals) {
		socket.on('welcome', function(user) {
			socket.emit('id', socket.id);
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
			socket.broadcast.emit('update rooms', auxiliaryRequire.objectToArray(games[socket.game].rooms));
		});
	};

	var publicSetOnDisconnect = function(socket, games, io, roomsIntervals) {
		socket.on('disconnect', function() {
			// console.log(Object.keys(socket.adapter.rooms));
			var rooms = Object.keys(socket.adapter.rooms);
			for(var i = 0; i < rooms.length; i++) {
				if(rooms[i].indexOf("_") !== -1) {
					io.in(rooms[i]).emit('offline', rooms[i]);
				}
			}
			if(socket.game) {
				var room = games[socket.game].rooms[socket.roomId];
				var player;
				
				if(room) {
					player = room.findPlayerById(socket.id);
				}

				if(player) {
					databaseRequire.updateUserStatistics(player, socket.startTime);
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
				}
			
				io.emit('update rooms', auxiliaryRequire.objectToArray(games[socket.game].rooms));
			}
		});
	};

	var publicSetOnMessage = function(socket, io) {
		socket.on('message', function(data) {
			var chatName = auxiliaryRequire.generateChatName(data.from, data.to);
			console.log(JSON.stringify(data) + "  " + chatName);
			// socket.broadcast.to(chatName).emit('message', 'enjoy the game');
			socket.emit('message', {
				from: data.to,
				to: data.from,
				content: "<b>" + data.from + "</b>: " + data.content,
				messageIcon: false
			});

			socket.broadcast.to(chatName).emit('message', {
				from: data.from,
				to: data.to,
				content: "<b>" + data.from + "</b>: "+ data.content,
				messageIcon: true
			});
			// console.log(data.from + "    " + data.to + "   " + data.content);
		});
	};

	var publicSetOnJoinChatRequest = function(socket, io) {
		socket.on('join me to friends chats', function(data) {
			for(var i = 0; i < data.friends.length; i++) {
				// console.log(auxiliaryRequire.generateChatName(data.name, data.friends[i]));
				var roomName = auxiliaryRequire.generateChatName(data.name, data.friends[i]);
				socket.join(roomName);
				socket.broadcast.to(roomName).emit('online', roomName);
				var room = io.sockets.adapter.rooms[roomName];
				// console.log(Object.keys(room).length);
				if(Object.keys(room).length > 1) {
					socket.emit('online', roomName);
				}
				// console.log(io.sockets.adapter.rooms);
			}
		});
	};

	return {
		setOnWelcome: publicSetOnWelcome,
		setOnDisconnect: publicSetOnDisconnect,
		setOnMessage: publicSetOnMessage,
		setOnJoinChatRequest: publicSetOnJoinChatRequest
	}
})();