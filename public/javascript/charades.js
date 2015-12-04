//------------------------------------JQuery---------------------------------------------
$(document).ready(function() {
	//$("#myCanvas").hide();
	$("#tool-belt").hide();
	$("#create").on('click', function() {
		sendWelcome($("#roomname").val());
	});
			
	//jeżeli dodajemy element dynamicznie (append) to tak wygląda funkcja on click jquery
	$(document).on('click','.roomEnter',function(){
		sendWelcome($(".roomEnter #singleRoomName").text());
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
			socket.emit('chat-message', {
				sender: player.name,
				content: $("#right-container #chat #input-chat #message input").val()
			});
			$("#right-container #chat #input-chat #message input").val("");
		});

	$("#right-container #chat #input-chat #message input").keypress(function(e){
			if(e.which == 13) {
				$("#right-container #chat #input-chat #send-button button").click();//Trigger search button click event
	        }
    	});

	sendWelcome("testowy");
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

socket.on('update', function(data) {
	if(data.room.currentWord) {
		currentCategory.text = "Category: " + data.room.currentWord.category;
		currentWord.text = (data.room.currentPlayer.name == player.name) ? "Word: " + data.room.currentWord.word : "";
	}
	whoIsDrawing.text = (data.room.currentPlayer.name == player.name) ? "You are drawing" : data.room.currentPlayer.name + " is drawing";
	timer.text = data.room.timer;
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
	$("#right-container #chat #output-chat")
		.animate({ scrollTop: $(document).height() }, "fast");
});
		
function sendWelcome(roomName) {
	socket.emit('welcome', {
		name:	player.name,
		room:	roomName,
		game: 	"charades"
	});
		
	$("#myCanvas").show();
	$("#tool-belt").show();
	$("#rooms").hide();
};

//------------------------------------Player-----------------------------------------------
var player = {
	name: 			"Guest" + Math.floor(Math.random() * 1000),
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
var whoIsDrawing;
var timer;

function create() {

	game.stage.backgroundColor = 0xfdf5d6;
    graphics = game.add.graphics(0, 0);


    game.input.onDown.add(onDown, this);
    game.input.onUp.add(onUp, this);
    game.input.addMoveCallback(trace, this);

    var style = { font: "30px Arial", fill: "black", align: "center" };

    whoIsDrawing = game.add.text(20, 70, "", style);
    currentCategory = game.add.text(20, 105, "Category:", style);
    currentWord = game.add.text(20, 140, "", style);
    
    timer = game.add.text(950, 70, "", style);
}


function onDown(pointer) {
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
	})
}


function onUp(pointer) {
	draw = false;
}


function trace(pointer) {
    if (draw && (Math.abs(pointer.x - lastX) > length || Math.abs(pointer.y - lastY) > length)) {
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