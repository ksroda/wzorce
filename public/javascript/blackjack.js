//------------------------------------JQuery---------------------------------------------
$(document).ready(function() {
	$("#create").on('click', function() {
		sendWelcome($("#roomname").val());
	});
		
	//jeżeli dodajemy element dynamicznie (append) to tak wygląda funkcja on click jquery
	$(document).on('click','.roomEnter',function(){
		sendWelcome($(".roomEnter #singleRoomName").text());
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
	for(var i = 0; i < data.cards.length; i++) {
		if(!cards[data.cards[i].id]) {
			createCard(data.cards[i]);
		}
		cards[data.cards[i].id].model.position.x = data.cards[i].x;
		cards[data.cards[i].id].model.position.y = data.cards[i].y;
	}
});



//------------------------------------Phraser-------------------------------------------
var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var cardsGroup;

var cards = {};


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
				game.load.image(symbols[j].type + suits[i], 'cards/png/' + symbols[j].type + "_of_" +  suits[i] + ".png");
			}
		}
	
}

function create() {
	cardsGroup = game.add.group();

	//var sprite = cardsGroup.create(120, 120, '2clubs');
}

function update() {

}

function createCard(card) {
	cards[card.id] = {
		model: cardsGroup.create(card.x, card.y, card.type),
		value: card.value
	}
	cards[card.id].model.scale.setTo(0.25, 0.25);
	//console.log(cards[card.id].model);
	//console.log(cards[card.id]);
}