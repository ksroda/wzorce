//------------------------------------JQuery---------------------------------------------
$(document).ready(function() {
	// // $("#tool-belt").hide();
	// // $("#right-container").hide();
	// // $("#right-container-ranking").hide();
	
	// $("#create").on('click', function() {
	// 	// sendWelcome($("#roomname").val());
	// });
			
	// //jeżeli dodajemy element dynamicznie (append) to tak wygląda funkcja on click jquery
	// $(document).on('click','.roomEnter',function(){
	// 	// sendWelcome($(".singleRoomName", this).text());
	// });
		
	// $(".color").on('click', function() {
	// 	player.pathProperties.color = (this.id == "yellow" ? 0xF7FF00 : 
	// 									(this.id == "blue" ? 0x0000FF : 
	// 										(this.id == "white" ? 0xFFFFFF : 
	// 											(this.id == "green" ? 0x00FF00 : 
	// 												(this.id == "red" ? 0xFF0000 : 0x000000)))));
	// });
		
	// $(".size").on('click', function() {
	// 	player.pathProperties.size = this.id;
	// });

	// $("#right-container #chat #input-chat #send-button button")
	// 	.on('click', function() {
	// 		//alert($("#right-container #chat #input-chat #message input").val());
	// 		var input = $("#right-container #chat #input-chat #message input");
	// 		socket.emit('chat-message', {
	// 			sender: player.name,
	// 			content: input.val()
	// 		});
	// 		input.val("");
	// 	});

	// $('[data-toggle="tooltip"]').tooltip("show");
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
		
// socket.on('update rooms', function(rooms) {
// 	angular.element($('#rooms')).scope().update(rooms);
// });

// socket.on('update', function(room) {
// 	subject.notify(room);
// });

socket.on('clear screen', function() {
	graphics.kill();
	graphics = game.add.graphics(0, 0);


    game.input.onDown.add(onDown, this);
    game.input.onUp.add(onUp, this);
    game.input.addMoveCallback(trace, this);
});

socket.on('chat-message', function(message) {
	var li = $("<li />")
		.attr({ "class":(message.sender == player.name ? "myMessage" : "") })
		.text(message.sender + ": " + message.content);

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
