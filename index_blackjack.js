var auxiliaryRequire = require('./index_auxiliary.js');

function Card(id, x, y, goalX, goalY, type, value){
  this.id = id;
	this.x = x;
	this.y = y;
	this.goalX = goalX;
	this.goalY = goalY;
	this.value = value;
}

var getCardsStack = function() {
	var cards = [
		{id:'2Spades', value: 2},
		{id:'3Spades', value: 3},
		{id:'4Spades', value: 4},
		{id:'5Spades', value: 5},
		{id:'6Spades', value: 6},
		{id:'7Spades', value: 7},
		{id:'8Spades', value: 8},
		{id:'9Spades', value: 9},
		{id:'10Spades', value: 10},
		{id:'jSpades', value: 10},
		{id:'qSpades', value: 10},
		{id:'kSpades', value: 10},
		{id:'aSpades', value: 11}
		]
		
		return cards;	
}
module.exports.getCardsStack = getCardsStack;

var gameLoop = function gameLoop(io, room) {
	var now = (new Date()).getTime();
	switch(room.state) {
		case "bet":
			if(now- room.roomStartTime > room.betTime){
				for(var i=0; i<room.playersAll.length; i++){
					if(room.playersAll[i].pointsBet >0){
						room.players.push(room.playersAll[i]);
					}
				}
				room.state = "deal";
				room.currentPlayer = room.players[0];
			}
			room.controlDealTime = (new Date()).getTime();
			break;
		case "deal":
			if(now - room.controlDealTime > room.timeBetweenCardsDeal) {
				console.log(room.players);
				room.controlDealTime = now;
				var cardIndex = Math.floor(Math.random() * room.cardsStack.length);
				var card = room.cardsStack[cardIndex];
				console.log(card);
				room.cards.push(new Card(card.id, 1000, 200, room.currentPlayer.x, room.currentPlayer.y, card.value));
				room.cardsStack.splice(cardIndex, 1);
				if(room.isCardForDealer){
					room.cards[room.cards.length -1].goalX=600;
					room.cards[room.cards.length -1].goalY=200;				
					room.dealerCardsSum += card.value;
					room.dealerCardsNumber += 1;
					room.isCardForDealer = false;
				}
				else{
					room.currentPlayer.cardsSum += card.value;
					room.currentPlayer.cardsNumber += 1;
					if(room.currentPlayer.id === room.players[room.players.length-1].id){
						room.isCardForDealer = true;
					}
					var index = room.players.indexOf(room.currentPlayer);
					index++;
					if(index > room.players.length - 1) {
						index = 0;
					}
					room.currentPlayer = room.players[index];
				}			
			}
			if(room.players.indexOf(room.currentPlayer) === 0 && room.currentPlayer.cardsNumber == 2){
				room.state = "game";
			} else {
				break;
			}
			room.currentPlayerTime = (new Date()).getTime();
		case "game":
			switch (room.currentPlayer.action){
				case "hit":
					var cardIndex = Math.floor(Math.random() * room.cardsStack.length);
					var card = room.cardsStack[cardIndex];
					room.cards.push(new Card(card.id, 1000, 200, room.currentPlayer.x, room.currentPlayer.y, card.value));		
					room.cardsStack.splice(cardIndex, 1);
					room.currentPlayer.cardsSum += card.value;
					room.currentPlayer.cardsNumber += 1;
					if(room.currentPlayer.cardsSum > 21 ){
						var index = room.players.indexOf(room.currentPlayer);
						index++;
						if(index > room.players.length - 1) {
							index = 0;
						}
						room.currentPlayer = room.players[index];
						room.players.splice(room.players.indexOf(room.currentPlayer), 1);
					}
					room.currentPlayerTime = now;
					room.currentPlayer.action = "none";
					break;
				case "stand":
					var index = room.players.indexOf(room.currentPlayer);
					index++;
					if(index > room.players.length - 1) {
						index = 0;
					}
					room.currentPlayer = room.players[index];
					room.isRoundStarted = true;
					break;
				case "split":	
					//TODO
					break;
				case "double":
					//TODO
					break;
			}
			if(now - room.currentPlayerTime > room.timeToThink){
				room.currentPlayerTime = now;
				var index = room.players.indexOf(room.currentPlayer);
				console.log(index);
				index++;
				if(index > room.players.length - 1) {
					index = 0;
				}
				room.currentPlayer = room.players[index];	
				room.isRoundStarted = true;
			}
			if(room.players.indexOf(room.currentPlayer) === 0 && room.isRoundStarted){
				room.state = "dealersTurn";
			}
			else{
				break;
			}
		case "dealersTurn":
			if( now - room.controlDealTime > room.timeBetweenCardsDeal){
				room.controlDealTime = now;
				if(room.dealerCardsSum < 17 ) {
					var cardIndex = Math.floor(Math.random() * room.cardsStack.length);
					var card = room.cardsStack[cardIndex];
					room.cards.push(new Card(card.id, 1000, 200, 600, 200, card.value));
					room.cardsStack.splice(cardIndex, 1);
					room.dealerCardsSum += card.value;
					room.dealerCardsNumber += 1;
					if(room.dealerCardsSum > 21) {
						for(var i = 0; i < room.players.length; i++) {
							room.players[i].overallPoints += 2 * room.players[i].pointsBet;
						}
						room.state = "reset";
					}
				} else {
					for(var i = 0; i < room.players.length; i++) {
						if(room.players[i].cardsSum > room.dealerCardsSum) {
							room.players[i].overallPoints += 2 * room.players[i].pointsBet;
						}
					}
					room.state = "reset";
				}	
			}
			break;
		case "reset":
			//delete room.cards;
			room.cards = [];
			//room.players = []; Usunięte tylko na czas testów
			for(var i = 0; i < room.playersAll.length; i++) {
				room.playersAll[i].pointsBet = 100;
				room.playersAll[i].cardsNumber = 0;
				room.playersAll[i].cardsSum = 0;
				room.playersAll[i].action = "none";
			}
			room.state = "bet";

			
			room.players = [];
			room.currentPlayer = 0;
			//playersAll: [],
			//state: "bet",
			//cards: [],
			room.dealerCardsSum = 0;
			room.roomStartTime = (new Date()).getTime();
			room.controlDealTime = (new Date()).getTime(),
			room.isCardForDealer = false;
			room.isRoundStarted = false;
			room.cardsStack = getCardsStack();
			room.currentPlayerTime = (new Date()).getTime();
			break;
	}
	for(var i = 0; i < room.cards.length; i++) {
		if(room.cards[i].x < room.cards[i].goalX) {
			room.cards[i].x += 10;
		} else {
			room.cards[i].x -= 10;
		}
		
		if(room.cards[i].y < room.cards[i].goalY) {
			room.cards[i].y += 10;
		} else {
			room.cards[i].y -= 10;
		}
	}
	io.to(room.id).emit({
		
	});
	console.log(room.state);
}
module.exports.gameLoop = gameLoop;


module.exports.createRoom = function(games, io, roomName, roomsIntervals) {
	var room = {
			id: "blackjack." + roomName,
			name: roomName,
			usersNum: 0,
			currentPlayer: 0,
			players: [],
			playersAll: [],
			state: "bet",
			cards: [],
			dealerCardsSum: 0,
			betTime: 5000,
			roomStartTime: (new Date()).getTime(),
			timeBetweenCardsDeal: 500,
			controlDealTime: (new Date()).getTime(),
			isCardForDealer: false,
			isRoundStarted: false,
			cardsStack: getCardsStack(),
			timeToThink: 15000,
			currentPlayerTime: (new Date()).getTime()
		};
	
	games["blackjack"].rooms.push(room);
	
	var intervalId = Math.random() * 10000000;
	
	games["blackjack"].rooms[auxiliaryRequire.findRoomByName(games, "blackjack", roomName)].interval = intervalId;
	
	var interval = setInterval(function() {
		gameLoop(io, games["blackjack"].rooms[auxiliaryRequire.findRoomByName(games, "blackjack", roomName)]);
	}, 33);
	
	roomsIntervals[intervalId] = interval;
}

module.exports.createPlayer = function(games, user, roomName) {
	var roomIndex = auxiliaryRequire.findRoomByName(games, "blackjack", roomName);
	games["blackjack"].rooms[roomIndex].playersAll.push(user);
}