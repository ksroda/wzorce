//------------------------------------JQuery---------------------------------------------
$(document).ready(function() {
	$("#tool-belt").hide();
	$("#right-container").hide();
	
	$("#create").on('click', function() {
		sendWelcome($("#roomname").val());
	});
			
	//jeżeli dodajemy element dynamicznie (append) to tak wygląda funkcja on click jquery
	$(document).on('click','.roomEnter',function(){
		sendWelcome($(".singleRoomName", this).text());
	});
		
	$(".color").on('click', function() {
		player.pathProperties.color = (this.id == "yellow" ? 0xF7FF00 : 
										(this.id == "blue" ? 0x0000FF : 
											(this.id == "white" ? 0xFFFFFF : 
												(this.id == "green" ? 0x00FF00 : 
													(this.id == "red" ? 0xFF0000 : 0x000000)))));
	});
		
	$(".size").on('click', function() {
		player.pathProperties.size = this.id;
	});

	$("#right-container #chat #input-chat #send-button button")
		.on('click', function() {
			//alert($("#right-container #chat #input-chat #message input").val());
			var input = $("#right-container #chat #input-chat #message input");
			socket.emit('chat-message', {
				sender: player.name,
				content: input.val()
			});
			input.val("");
		});

	$("#right-container #chat #input-chat #message input").keypress(function(e){
			if(e.which == 13) {
				$("#right-container #chat #input-chat #send-button button").click();
	        }
    	});

	$('[data-toggle="tooltip"]').tooltip("show");
});



//------------------------------------Socket----------------------------------------------
var socket = io();

socket.on('mouse down', function(properties) {
	console.log(properties);
	graphics.lineStyle(properties.size, properties.color, 1);
	graphics.moveTo(properties.start.x, properties.start.y);
});
	
socket.on('mouse drag', function(position) {
	graphics.lineTo(position.x, position.y);
});
		
socket.on('update rooms', function(rooms) {
	angular.element($('#rooms')).scope().update(rooms);
});

socket.on('update', function(room) {
	if(room.currentWord) {
		currentCategory.text = "Category: " + room.currentWord.category;
		currentWord.text = (room.currentPlayer.name == player.name) ? "Word: " + room.currentWord.word : "";
	}
	whoIsDrawing.text = (room.currentPlayer.name == player.name) ? "You are drawing" : room.currentPlayer.name + " is drawing";
	timer.text = room.timer;
	iAmDrawing = (room.currentPlayer.name == player.name);

	var rankingUl = $("#right-container-ranking #ranking #ranking-table-content ul");
	rankingUl.html("");
	for(var i = 0; i < room.ranking.length; i++) {
		rankingUl.append("<li>"+
							"<div class=\"row\">"+
								"<div class=\"position col-sm-1\">" + (i+1) + "</div>"+
								"<div class=\"name col-sm-6\">" + room.ranking[i].name + "</div>"+
								"<div class=\"points col-sm-3\">" + room.ranking[i].localPoints + "</div>"+
								"<div class=\"points col-sm-1\">" + (room.ranking[i].name == room.currentPlayer.name ? "<span class=\"glyphicon glyphicon-pencil\">" : "") + "</span>"+
								"</div>"+
							"</div>"+
						"</li>");
	}
});

socket.on('clear screen', function() {
	graphics.kill();
	graphics = game.add.graphics(0, 0);


    game.input.onDown.add(onDown, this);
    game.input.onUp.add(onUp, this);
    game.input.addMoveCallback(trace, this);
});

socket.on('chat-message', function(message) {
	$("#right-container #chat #output-chat ul")
		.append("<li>"+message.sender + ": " + message.content+"</li>");
	var d = $("#right-container #chat #output-chat");
	d.scrollTop(d.prop("scrollHeight"));
});
		
function sendWelcome(roomName) {
	socket.emit('welcome', {
		name:	player.name,
		room:	roomName,
		game: 	"charades",
		overallPoints: player.overallPoints
	});
		
	$("canvas").show();
	$("#tool-belt").show();
	$("#rooms").hide();
	$("#right-container").show();
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

//---------------------------------Phaser-------------------------------------------
var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, 'phaser-example', { create: create, update: update, render: render });

var graphics;
var draw= false;
var i  = 0;
var lastX;
var lastY;
var length = 2;
var currentWord;
var currentCategory;
var iAmDrawing;
var whoIsDrawing;
var timer;

function create() {
	$("canvas").hide();
	game.stage.backgroundColor = 0xfdf5d6;
    graphics = game.add.graphics(0, 0);


    game.input.onDown.add(onDown, this);
    game.input.onUp.add(onUp, this);
    game.input.addMoveCallback(trace, this);

    var style = { font: "30px Arial", fill: "black", align: "center" };

    whoIsDrawing = game.add.text(20, 70, "", style);
    currentCategory = game.add.text(20, 105, "Category:", style);
    currentWord = game.add.text(20, 140, "", style);
    
    timer = game.add.text(window.innerWidth - 420, 70, "", style);

    //sendWelcome("testowy"); //Na czas testów
}


function onDown(pointer) {
	if(iAmDrawing) {
		graphics.lineStyle(player.pathProperties.size, player.pathProperties.color, 1);
		graphics.moveTo(pointer.x, pointer.y);
		draw = true;
		lastX = pointer.x;
		lastY = pointer.y;
		socket.emit('mouse down', {
			start: {
				x: pointer.x,
				y: pointer.y
			}, 
			size: player.pathProperties.size,
			color: player.pathProperties.color
		});
	}
}


function onUp(pointer) {
	draw = false;
}


function trace(pointer) {
    if (draw && (Math.abs(pointer.x - lastX) > length || Math.abs(pointer.y - lastY) > length) && iAmDrawing) {
      	graphics.lineTo(pointer.x, pointer.y);
		console.log(i++);
		lastX = pointer.x;
		lastY = pointer.y;
		socket.emit('mouse drag', {
			x: pointer.x,
			y: pointer.y
		})
    }
}

function update() {

}

function render() {

 

}