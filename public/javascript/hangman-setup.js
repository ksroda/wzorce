//------------------------------------JQuery---------------------------------------------
$(document).ready(function() {
	
	// $("#create").on('click', function() {
	// 	sendWelcome($("#roomname").val());
	// });
			
	//jeżeli dodajemy element dynamicznie (append) to tak wygląda funkcja on click jquery
	// $(document).on('click','.roomEnter',function(){
	// 	sendWelcome($(".singleRoomName", this).text());
	// });
		
	// $("body").on('click', ".letterButton", function() {
	// 	console.log(this.id);
	// 	socket.emit("letterButton", this.id);
	// });	
	// console.log("działam");
	
});


//------------------------------------Socket----------------------------------------------
var socket = io();
var gameLoaded = false;

socket.on('wrongLetter', function(data) {
	var id=data.litera;
	$('#'+id).css("background-color", "red").attr("disabled", true);
	if(hangmanPartIndex < 11) {
		hangman.animations.play('part' + hangmanPartIndex);
		hangmanPartIndex++;
	}
});

socket.on('correctLetter', function(data) {
	var id=data.litera;
	$('#'+id).css("background-color", "green").attr("disabled", true);
});

socket.on('unblockLetters', function() {
	$('.letterButton').css("background-color", "blue").attr("disabled", false);
});
		
		
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
