//------------------------------------Socket--------------------------------------------
var socket = io();
var gameLoaded = false;

if(!user.guest) {
	socket.emit('login', user.name);
}

socket.on('id', function(id) {
	player.id = id;
	myId = player.id;
});

socket.on('player disconnected', function(playerId) {
	if(userInfo[playerId]) {
		userInfo[playerId].name.kill();
		
		userInfo[playerId].cardsSum.kill();
		userInfo[playerId].pointsBet.kill();
		userInfo[playerId].status.kill();

		userInfo[playerId].splitProperties.cardsSum.kill();
		userInfo[playerId].splitProperties.pointsBet.kill();
		userInfo[playerId].splitProperties.status.kill();

		userInfo[playerId].insurence.kill();
	}
});

function sendWelcome(roomName) {
	socket.emit('welcome', {
		name:	player.name,
		room:	roomName,
		game: 	"blackjack",
		overallPoints: player.overallPoints
	});

	$("#top-container").hide();
};

//------------------------------------Player-----------------------------------------------
var player = {
	name: 			user.name,
	overallPoints:  user.overallPoints, 
	roomName:		0
};
