//------------------------------------Socket----------------------------------------------
var socket = io();
var gameLoaded = false;

socket.on('wrongLetter', function(data) {
	var id=data.letter;
	$('#'+id).css("background-color", "red").attr("disabled", true);
	var hangmanPartIndex = 11 - data.numOfChances;
	console.log(hangmanPartIndex);
	if(hangmanPartIndex <= 11) {
	    if(hangmanPartIndex > 0) {
	    	hangman.animations.play("part" + hangmanPartIndex);
	    }
	}
});

socket.on('correctLetter', function(data) {
	var id=data.letter;
	$('#'+id).css("background-color", "green").attr("disabled", true);
	for(var i = 0; i < data.positions.length; i++) {
		letters[data.positions[i]].letterValue = id.toUpperCase();
		letters[data.positions[i]].letter.setText(id.toUpperCase());
		letters[data.positions[i]].update("show");
	}
});

socket.on('unblockLetters', function() {
	$('.letterButton').css("background-color", "#1d3643").attr("disabled", false);
});

socket.on('id', function(id) {
	player.id = id;
});

		
function sendWelcome(roomName) {
	socket.emit('welcome', {
		name:	player.name,
		room:	roomName,
		game: 	"hangman",
		overallPoints: player.overallPoints
	});
};

//------------------------------------Player-----------------------------------------------
var player = {
	name: 			user.name,
	overallPoints:  user.overallPoints, 
	roomName:		0,
};
