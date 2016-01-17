//------------------------------------JQuery---------------------------------------------
$(document).ready(function() {
	$("body").on('click',"#show-chat", function() {
		$("#right-container").toggle();
		$("#right-container-ranking").hide();
	});
	$("body").on('click',"#show-ranking", function() {
		$("#right-container-ranking").toggle();
		$("#right-container").hide();
	});
});


//------------------------------------Socket----------------------------------------------
var socket = io();
var gameLoaded = false;

socket.on('mouse down', function(properties) {
	console.log(properties);
	graphics.lineStyle(properties.size, properties.color, 1);
	graphics.moveTo(properties.start.x, properties.start.y);
});
	
socket.on('mouse drag', function(position) {
	graphics.lineTo(position.x, position.y);
});

socket.on('id', function(id) {
	player.id = id;
});

socket.on('clear screen', function() {
	graphics.kill();
	graphics = game.add.graphics(0, 0);


    game.input.onDown.add(onDown, this);
    game.input.onUp.add(onUp, this);
    game.input.addMoveCallback(trace, this);
});

socket.on('chat-message', function(message) {
	var li = $("<li />")
		.attr({ "class":(message.sender == player.name ? "myMessage" : 
			((message.sender === "system-close" || message.sender === "system-win") ? message.sender : "")) })
		.html("<b>" + ((message.sender === "system-close" || message.sender === "system-win") ? "System" : message.sender)  + ":</b> " + message.content);

	$("#right-container #chat #output-chat ul").append(li);

	var d = $("#right-container #chat #output-chat");
	d.scrollTop(d.prop("scrollHeight"));
});
		
function sendWelcome(roomName) {
	socket.emit('welcome', {
		name:	player.name,
		room:	roomName,
		game: 	"pictionary",
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

	path:			0,
	pathProperties:	{
		color:	'black',
		size:		1
	},
	drawPath: function() {
		
	},
	addPoint: function(position) {

	}
};
