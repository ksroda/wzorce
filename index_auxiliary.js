var abc = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','r','s','t','u','w','x','y','z'];

module.exports.randomId = function randomId() {
	return randomLetter() + randomNumber() + randomLetter() + randomNumber() + 
			randomLetter() + randomNumber() + randomLetter() + randomNumber() + 
			randomLetter() + randomNumber() + randomLetter() + randomNumber() + 
			randomLetter() + randomNumber() + randomLetter() + randomNumber();
}

function randomLetter() {
	return abc[Math.floor(Math.random() * abc.length)];
}

function randomNumber() {
	return Math.floor(Math.random() * 10);
}

module.exports.findRoomByName = function findRoomByName(games, gameName, roomName) {
	for(var i = 0; i < games[gameName].rooms.length; i++) {
		if(games[gameName].rooms[i].name === roomName) return i;
	}
	return -1;
}