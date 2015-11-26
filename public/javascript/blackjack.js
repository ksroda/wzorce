//------------------------------------JQuery---------------------------------------------
$(document).ready(function() {
	$("#create").on('click', function() {
		sendWelcome($("#roomname").val());
	});
		
	//jeżeli dodajemy element dynamicznie (append) to tak wygląda funkcja on click jquery
	$(document).on('click','.roomEnter',function(){
		sendWelcome($(".roomEnter #singleRoomName").text());
	});

	$(".actionButton").on('click', function() {
		socket.emit("actionButton", this.id);
	});

	
});	


		
//------------------------------------Socket--------------------------------------------
var socket = io();

function sendWelcome(roomName) {
	socket.emit('welcome', {
		name:	"Guest" + Math.floor(Math.random() * 1000),
		room:	roomName,
		game: 	"blackjack"
	});
	$("#rooms").hide();
};

socket.on('id', function(id) {
	myId = id;
});

socket.on('player disconnected', function(playerId) {
	if(userInfo[playerId]) {
		userInfo[playerId].name.kill();
		userInfo[playerId].cardsSum.kill();
		userInfo[playerId].pointsBet.kill();
	}
});

socket.on('update rooms', function(rooms) {
	angular.element($('#rooms')).scope().update(rooms);
});

socket.on('update', function(data) {
	for(var i = 0; i < data.room.cards.length; i++) {
		if(!cards[data.room.cards[i].id]) {
			createCard(data.room.cards[i]);
		} else {
			cards[data.room.cards[i].id].updateGoal(data.room.cards[i]);
		}
	}

	for(var i = 0; i < data.room.players.length; i++) {
		if(!userInfo[data.room.players[i].id]) {
			userInfo[data.room.players[i].id] = new UserInfo(data.room.players[i]);
		} else {
			userInfo[data.room.players[i].id].update(data.room.players[i]);
		}
	}


	if(timer) timer.setText(data.room.timer);
	if(dealerCardsSum) dealerCardsSum.setText(data.room.dealerCardsSum);

	currentPlayer = data.room.currentPlayer;
	gameState = data.room.state;
	
});

socket.on('reset', function() {
	for(var x in cards) {
		cards[x].kill();
	}
});

//------------------------------------Phraser-------------------------------------------
var game = new Phaser.Game(1350, 700, Phaser.AUTO, '', { preload: preload, create: create, update: update }, true);
var cardsGroup;

var cards = {};
var style = { font: "18px Arial", fill: "#0000000", align: "center" };
var timer;
var dealerCardsSum;
var userInfo = {};
var myId;
var arrow;
var currentPlayerPointer;
var currentPlayer;
var gameState;

function preload() {
	var suits = ["hearts", "spades", "clubs", "diamonds"];
		var symbols = [
			{ type: 2	},
			{ type: 3	},
			{ type: 4	},
			{ type: 5	},
			{ type: 6	},
			{ type: 7	},
			{ type: 8	},
			{ type: 9	},
			{ type: 10	},
			{ type: "jack"	},
			{ type: "queen"	},
			{ type: "king"	},
			{ type: "ace"	}
		];

		for(var i in suits) {
			for(var j in symbols) {
				game.load.image(symbols[j].type + "_of_" + suits[i], 'cards/ost/' + symbols[j].type + "_of_" +  suits[i] + ".png");
				//game.load.image(symbols[j].type + suits[i], "cards/png/test2.png");
				//game.load.image(symbols[j].type + suits[i], 'cards/windows/' + suits[i] + symbols[j].type + ".png");
			}
		}
	game.load.image("table", "cards/table.png");
	game.load.image("arrow", "assets/arrow.png");
	game.load.image("blank", "assets/blank.png");
}

function create() {
	//game.stage.backgroundColor = 0x418026;
	game.time.desiredFps = 30;

	var table = game.add.sprite(675, 280, "table");
	game.physics.startSystem(Phaser.Physics.ARCADE);
	cardsGroup = game.add.group();
	timer = game.add.text(50, 50, "", style);
	dealerCardsSum = game.add.text(600, 80, "", style);
	
	table.scale.setTo(0.6, 0.6);
	table.anchor.set(0.5, 0.5);
	timer.anchor.set(0.5, 0.5);
	dealerCardsSum.anchor.set(0.5, 0.5);

	arrow = game.add.sprite(675, 30, "arrow");
	arrow.anchor.set(0.45, 0.5);
	//arrow.scale.setTo(0.5, 0.5);

	currentPlayerPointer = game.add.sprite(1080, 230, "blank");
	game.physics.enable(currentPlayerPointer, Phaser.Physics.ARCADE);
	currentPlayerPointer.body.allowRotation = false;
	currentPlayerPointer.anchor.set(0.5, 0.5);

	//sendWelcome("testowy"); //Na czas testów
}

function update() {

	for(var i in cards) {
		cards[i].move();
	}

	//console.log(currentPlayerPointer);
	if(currentPlayer && currentPlayerPointer && gameState !== "deal") {
		var temp = game.input.activePointer;
		temp.x = currentPlayer.x;
		temp.y = currentPlayer.y;
		game.physics.arcade.moveToPointer(currentPlayerPointer, 50, temp, 300);
		//console.log(currentPlayerPointer);
		arrow.rotation = game.physics.arcade.angleBetween(arrow, { x: currentPlayerPointer.position.x, y: currentPlayerPointer.position.y });
	}

	
}

//UWAGA DEKORATOR
function createCard(card) {
	cards[card.id] = cardsGroup.create(card.x, card.y, card.type);
	cards[card.id].anchor.set(0.5, 0.5);

	cards[card.id].properties = {
		value: card.value,
		goalX: card.goalX,
		goalY: card.goalY
	};

	cards[card.id].move = function() {
		var temp = game.input.activePointer;
		temp.x = this.properties.goalX;
		temp.y = this.properties.goalY;
		game.physics.arcade.moveToPointer(this, 50, temp, 300);
	}

	cards[card.id].updateGoal = function(card) {
		this.properties.goalX = card.goalX;
		this.properties.goalY = card.goalY;
	}

	game.physics.enable(cards[card.id], Phaser.Physics.ARCADE);
	cards[card.id].body.allowRotation = false;
	//cards[card.id].scale.setTo(0.5, 0.5);
}

function UserInfo(player) {
	this.name = game.add.text(player.x, player.y + 100, player.name, style);
	this.cardsSum = game.add.text(player.x - 70, player.y, player.cardsSum, style);
	this.pointsBet = game.add.text(player.x, player.y + 80, player.pointsBet, style);
	if(player.id === myId) this.overallPoints = game.add.text(100, 600, "Overll points: " + player.overallPoints, style);

	this.name.anchor.set(0.5, 0.5);
	this.cardsSum.anchor.set(0.5, 0.5);
	this.pointsBet.anchor.set(0.5, 0.5);
}

UserInfo.prototype.update = function(player) {
	this.name.setText(player.name);
	this.cardsSum.setText(player.howManyAces > 0 ? player.cardsSum + "/" + (player.cardsSum - 10) : player.cardsSum);
	this.pointsBet.setText(player.pointsBet);
	if(player.id === myId) this.overallPoints.setText("Overall points: " + player.overallPoints);
}