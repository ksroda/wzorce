//------------------------------------JQuery---------------------------------------------
$(document).ready(function() {
	
});


//------------------------------------Socket----------------------------------------------
var socket = io();
		
// socket.on('update rooms', function(rooms) {
// 	angular.element($('#rooms')).scope().update(rooms);
// });

// socket.on('update', function(room) {
// 	subject.notify(room);
// });
		
function sendWelcome(roomName) {
	socket.emit('welcome', {
		name:	player.name,
		room:	roomName,
		game: 	"hangman",
		overallPoints: player.overallPoints
	});
		
	// $("canvas").show();
	// $("#tool-belt").show();
	// $("#rooms").hide();
	// $("#right-container").show();
	// $("#right-container-ranking").show();
};

//------------------------------------Player-----------------------------------------------
var player = {
	name: 			user.name,
	overallPoints:  user.overallPoints, 
	roomName:		0,
};
