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

socket.on('update rooms', function(rooms) {
	angular.element($('#rooms')).scope().update(rooms);
});

socket.on('update', function(data) {
	subject.notify(data);
});

// socket.on('reset', function() {
// 	for(var x in cards) {
// 		cards[x].kill();
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
