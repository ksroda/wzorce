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
		}
		cards[data.room.cards[i].id].position.x = data.room.cards[i].x;
		cards[data.room.cards[i].id].position.y = data.room.cards[i].y;

		cards[data.room.cards[i].id].properties.goalX = data.room.cards[i].goalX;
		cards[data.room.cards[i].id].properties.goalY = data.room.cards[i].goalY;
	}


	for(var i = 0; i < data.room.players.length; i++) {
		if(!userInfo[data.room.players[i].id]) {
			createUserInfo(data.room.players[i]);
		}
		updateUserInfo(data.room.players[i]);
	}


	if(timer) timer.setText(data.room.timer);
	if(dealerCardsSum) dealerCardsSum.setText(data.room.dealerCardsSum);
});

socket.on('reset', function() {
	for(var x in cards) {
		//console.log(cards[x]);
		cardsGroup.remove(cards[x]);
	}
	cardsGroup = game.add.group();
});

//------------------------------------Phraser-------------------------------------------
var lastLoop = new Date;
var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '', { preload: preload, create: create, update: update });
//game.physics.startSystem(Phaser.Physics.ARCADE);
var cardsGroup;

var cards = {};
var style = { font: "30px Arial", fill: "#ff0044", align: "center" };
var timer;
var dealerCardsSum;
var userInfo = {};

function preload() {
	var suits = ["hearts", "spades", "clubs", "diamonds"];
		var symbols = [
			{ type:2 },
			{ type:3 },
			{ type:4},
			{ type:5},
			{ type:6},
			{ type:7},
			{ type:8},
			{ type:9},
			{ type:10},
			{ type:"jack" },
			{ type:"queen" },
			{ type:"king" },
			{ type:"ace" }
		];

		for(var i in suits) {
			for(var j in symbols) {
				//game.load.image(symbols[j].type + suits[i], 'cards/png/' + symbols[j].type + "_of_" +  suits[i] + ".png");
				game.load.image(symbols[j].type + suits[i], "cards/png/test4.png");
			}
		}
	
}

function create() {
	cardsGroup = game.add.group();
	timer = game.add.text(50, 50, "", style);
	dealerCardsSum = game.add.text(500, 50, "", style);
}

function update() {
	for(var i in cards) {
		if(Math.abs(cards[i].position.x - cards[i].properties.goalX) > 10 || Math.abs(cards[i].position.y - cards[i].properties.goalY) > 10) {
				var angle;
				var cardX = cards[i].position.x;
				var cardY = cards[i].position.y;
						
				angle = Math.atan((cards[i].properties.goalY - cardY)/(cards[i].properties.goalX - cardX));
				if(cards[i].properties.goalX >= cardX) {
					angle += Math.PI;
				}
						
				cards[i].position.x -= 10;	
				var cardEndX = (cards[i].position.x - cardX) * Math.cos(angle) - (cards[i].position.y - cardY) * Math.sin(angle) + cardX;
				var cardEndY = (cards[i].position.x - cardX) * Math.sin(angle) + (cards[i].position.y - cardY) * Math.cos(angle) + cardY;
						
				cards[i].position.x = cardEndX;
				cards[i].position.y = cardEndY;
			
		} else {
			cards[i].position.x = cards[i].properties.goalX;
			cards[i].position.y = cards[i].properties.goalY;
		}
	}
	//ups();
}

//UWAGA DEKORATOR
function createCard(card) {
	cards[card.id] = cardsGroup.create(card.x, card.y, card.type);
	cards[card.id].properties = {
		value: card.value,
		goalX: card.goalX,
		goalY: card.goalY
	};
	//game.physics.enable(cards[card.id], Phaser.Physics.ARCADE);
	//cards[card.id].scale.setTo(0.5, 0.5);
}

function createUserInfo(player) {
	var cardsSum = game.add.text(player.x, player.y - 50, player.cardsSum, style);
	var pointsBet = game.add.text(player.x, player.y + 120, player.pointsBet, style);
	var overallPoints = game.add.text(player.x + 100, player.y + 120, player.overallPoints, style);

	userInfo[player.id] = {
		cardsSum: cardsSum,
		pointsBet: pointsBet,
		overallPoints: overallPoints
	}
}

function updateUserInfo(player) {
	userInfo[player.id].cardsSum.setText(player.cardsSum);
	userInfo[player.id].pointsBet.setText(player.pointsBet);
	userInfo[player.id].overallPoints.setText(player.overallPoints);
}


function ups() { 
    var thisLoop = new Date;
    var fps = Math.floor(1000 / (thisLoop - lastLoop));
	console.log(fps + "UPS");
    lastLoop = thisLoop;
}