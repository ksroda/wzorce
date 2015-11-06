var auxiliaryRequire = require('./index_auxiliary.js');

module.exports.createRoom = function(games, io, roomName, roomsIntervals) {
	var room = {
		id: "charades." + roomName,
		name: roomName,
		usersNum: 0,
		playersAll: []
	}		
	
	games["charades"].rooms.push(room);
}

module.exports.createPlayer = function(games, user, roomName) {
	var roomIndex = auxiliaryRequire.findRoomByName(games, "charades", roomName);
	games["charades"].rooms[roomIndex].playersAll.push(user);
}