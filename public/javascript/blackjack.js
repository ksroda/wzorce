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
	}

	for(var i = 0; i < data.room.players.length; i++) {
		//console.log(data.room.players[i]);
		if(!cardsSums[data.room.players[i].id]) {
			createCardSum(data.room.players[i]);
		}
		cardsSums[data.room.players[i].id].setText(data.room.players[i].cardsSum);
	}

	if(timer) timer.setText(data.room.timer);
});

socket.on('reset', function() {
	for(var x in cards) {
		//console.log(cards[x]);
		cardsGroup.remove(cards[x]);
	}
	cardsGroup = game.add.group();
});

//------------------------------------Phraser-------------------------------------------
var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var cardsGroup;

var cards = {};
var cardsSums = {};
var style = { font: "65px Arial", fill: "#ff0044", align: "center" };
var timer;

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
				game.load.image(symbols[j].type + suits[i], "cards/svg/test.svg");
			}
		}
	
}

function create() {
	cardsGroup = game.add.group();
	timer = game.add.text(50, 50, "", style);
}

function update() {

}

//UWAGA DEKORATOR
function createCard(card) {
	cards[card.id] = cardsGroup.create(card.x, card.y, card.type);
	cards[card.id].properties = {
		value: card.value
	};

	//cards[card.id].scale.setTo(0.25, 0.25);
}

function createCardSum(player) {
	var sum = game.add.text(player.x, player.y - 50, player.cardsSum, style);

	cardsSums[player.id] = sum;
}