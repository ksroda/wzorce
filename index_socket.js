var auxiliaryRequire = require('./index_auxiliary.js');

module.exports.setOnWelcome = function(socket, games, io, roomsIntervals) {
		socket.on('welcome', function(user) {
			socket.name = user.name;
			socket.room = user.room;
			socket.game = user.game;
			socket.join(socket.game + "." + socket.room);
			

			var i = auxiliaryRequire.findRoomByName(games, socket.game, socket.room);
			if(i === -1) {
				games[socket.game].createRoom(games, io, socket.room, roomsIntervals);
			}
			
			games[socket.game].rooms[auxiliaryRequire.findRoomByName(games, socket.game, socket.room)].usersNum += 1;


			var player = {
				id: socket.id,
				name: socket.name,
				room: socket.room,
				overallPoints: 1000,
				inGame: true
			}
			
			switch(socket.game){
				case "blackjack":
					player.cardsNumber = 0;
					player.action = "none";
					player.cardsSum = 0;
					player.pointsBet = 100;
					player.x = 1000 - 200 * games[socket.game].rooms[auxiliaryRequire.findRoomByName(games, socket.game, socket.room)].playersAll.length;
					player.y = 400;
					break;			
			}


			games[socket.game].createPlayer(games, player, socket.room);
			io.emit('update rooms', games[socket.game].rooms);
		});
	};
	
module.exports.setOnDisconnect = function(socket, games, io, roomsIntervals) {
		socket.on('disconnect', function() {
			if(socket.game) {
				var roomIndex = auxiliaryRequire.findRoomByName(games, socket.game, socket.room);
				if(-1 != roomIndex) { 
					games[socket.game].rooms[roomIndex].usersNum -= 1;
					
					for(var i = 0; i < games[socket.game].rooms[roomIndex].playersAll.length; i++) {
						if(games[socket.game].rooms[roomIndex].playersAll[i].id === socket.id) {
							games[socket.game].rooms[roomIndex].playersAll.splice(i, 1);
							break;
						}
					}
			
					if(games[socket.game].rooms[roomIndex].usersNum <= 0) {
						clearInterval(roomsIntervals[games[socket.game].rooms[roomIndex].interval]);
						games[socket.game].rooms.splice(roomIndex, 1);
					}
			
					io.emit('update rooms', games[socket.game].rooms);
				}
			}
		});
	};
	
module.exports.setOnMessage = function(socket, io) {
		socket.on('message', function(msg) {
				io.to(socket.game + "." + socket.room).emit('message', msg);
		});
	};
	

//--------------------------------------------------------------Charades-----------------------------------------------------------
module.exports.setOnMouseDown = function(socket) {
			socket.on('mouse down', function(msg) {
					socket.broadcast.to(socket.game + "." + socket.room).emit('mouse down', msg);
			});
		};
		
module.exports.setOnMouseDrag = function(socket) {
			socket.on('mouse drag', function(msg) {
					socket.broadcast.to(socket.game + "." + socket.room).emit('mouse drag', msg);
			});
		}

//-------------------------------------------------------------Blackjack-----------------------------------------------------------

module.exports.setOnActionChange = function(socket, games) {
			socket.on('actionButton', function(action) {
				console.log(action + "  " + socket);
				var roomIndex = auxiliaryRequire.findRoomByName(games, socket.game, socket.room);
				var currentPlayer = games[socket.game].rooms[roomIndex].currentPlayer;
				if(currentPlayer.id == socket.id) {
					currentPlayer.action = action;
				}
			});
}