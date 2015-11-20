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

	//sendWelcome("testowy"); //Na czas testów
});	


		
//------------------------------------Socket--------------------------------------------
var socket = io();

function sendWelcome(roomName) {
	socket.emit('welcome', {
		name:	"Marek",
		room:	roomName,
		game: 	"blackjack"
	});
	$("#rooms").hide();
};


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
});

socket.on('reset', function() {
	for(var x in cards) {
		cards[x].kill();
	}
});

//------------------------------------Phraser-------------------------------------------
var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var cardsGroup;

var cards = {};
var style = { font: "30px Arial", fill: "#ff0044", align: "center" };
var timer;
var dealerCardsSum;
var userInfo = {};

function preload() {
	var suits = ["h", "s", "c", "d"];
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
			{ type: "j"	},
			{ type: "q"	},
			{ type: "k"	},
			{ type: "a"	}
		];

		for(var i in suits) {
			for(var j in symbols) {
				//game.load.image(symbols[j].type + suits[i], 'cards/png/' + symbols[j].type + "_of_" +  suits[i] + ".png");
				game.load.image(symbols[j].type + suits[i], "cards/png/test2.png");
				//game.load.image(symbols[j].type + suits[i], 'cards/windows/' + suits[i] + symbols[j].type + ".png");
			}
		}
}

function create() {
	game.physics.startSystem(Phaser.Physics.ARCADE);
	cardsGroup = game.add.group();
	timer = game.add.text(50, 50, "", style);
	dealerCardsSum = game.add.text(500, 50, "", style);
}

function update() {

	for(var i in cards) {
		cards[i].move();
	}
}

//UWAGA DEKORATOR
function createCard(card) {
	cards[card.id] = cardsGroup.create(card.x, card.y, card.type);

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
	this.cardsSum = game.add.text(player.x, player.y - 50, player.cardsSum, style);
	this.pointsBet = game.add.text(player.x, player.y + 120, player.pointsBet, style);
	this.overallPoints = game.add.text(player.x + 100, player.y + 120, player.overallPoints, style);
}

UserInfo.prototype.update = function(player) {
	this.cardsSum.setText(player.cardsSum);
	this.pointsBet.setText(player.pointsBet);
	this.overallPoints.setText(player.overallPoints);
}
