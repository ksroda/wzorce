//------------------------------------JQuery---------------------------------------------
$(document).ready(function() {
	// $(".actionButtons").hide();
	// $(".betButtons").hide();
	// $("#titleblack").show();

	// $("#create").on('click', function() {
	// 	// sendWelcome($("#roomname").val());
	// });
		
	// //jeżeli dodajemy element dynamicznie (append) to tak wygląda funkcja on click jquery
	// $(document).on('click','.roomEnter',function(){
	// 	// sendWelcome($(".singleRoomName", this).text());
	// });

	// $(".actionButton").on('click', function() {
		
	// });

	// $(".betButton").on('click', function() {
	// 	// socket.emit("betButton", this.id);
	// });

	// $('[data-toggle="tooltip"]').tooltip("show");
});	


		
//------------------------------------Socket--------------------------------------------
var socket = io();
var gameLoaded = false;

if(!user.guest) {
	socket.emit('login', user.name);
}

socket.on('id', function(id) {
	myId = id;
});

socket.on('player disconnected', function(playerId) {
	if(userInfo[playerId]) {
		userInfo[playerId].name.kill();
		userInfo[playerId].cardsSum.kill();
		userInfo[playerId].pointsBet.kill();
		userInfo[playerId].status.kill();
	}
});

// socket.on('update rooms', function(rooms) {
// 	var controller = angular.element($('#rooms')).scope();
// 	if(controller) {
// 		controller.update(rooms);
// 	}
// });

// socket.on('update', function(data) {
// 	if(gameLoaded) {
// 		subject.notify(data);
// 	}
// });

function sendWelcome(roomName) {
	socket.emit('welcome', {
		name:	player.name,
		room:	roomName,
		game: 	"blackjack",
		overallPoints: player.overallPoints
	});

	// $("canvas").show();
	// $("#rooms").hide();
	$("#top-container").hide();
	//$(".actionButtons").show();
};

//------------------------------------Player-----------------------------------------------
var player = {
	name: 			user.name,
	overallPoints:  user.overallPoints, 
	roomName:		0
};
