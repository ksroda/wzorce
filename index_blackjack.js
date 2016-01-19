var auxiliaryRequire = require('./index_auxiliary.js')();


function GameState(func) {
	this.state = func;
}

GameState.prototype.execute = function(room) {
	this.state(room);
}

module.exports = (function () {
  var instance;
 
  function init() {
 	var blackjack = {
		rooms: {}
	}

	blackjack.createRoom = function(io, roomName, roomIntervals) {
		var room = new Room(roomName, (new Date).getTime());
		room.startLoop(io, roomIntervals);
		this.rooms[room.id] = room;
	}

	//-----------------------------------------------------------------Socket---------------------------------------------------

	blackjack.socketHandling = function(socket) {
		var self = this;
		socket.on('actionButton', function(action) {
			if(self.rooms[socket.roomId]) {
				var currentPlayer = self.rooms[socket.roomId].currentPlayer;
				if(currentPlayer.id === socket.id) {
					currentPlayer.action = action;
				}
			}
		});

		socket.on('betButton', function(bet) {
			if(self.rooms[socket.roomId]) {
				var player = self.rooms[socket.roomId].findPlayerById(socket.id);
				if(player !== undefined && self.rooms[socket.roomId].state === "bet" && player.overallPoints >= player.pointsBet + parseInt(bet)) {
					player.pointsBet += parseInt(bet);
				}
			}
		});
	}
	return blackjack;
  };
  
  return {
    getInstance: function () {
      if ( !instance ) {
        instance = init();
      }
      return instance;
    }
  };
})();


// module.exports = function() {
	
// }

//-------------------------------------------------------------------Room---------------------------------------------------


function Room(roomName, currentTime) {
	this.id 					= "blackjack." + roomName;
	this.name 					= roomName;
	this.usersNum 				= 0;
	this.currentPlayer 			= 0;
	this.players 				= [];
	this.playersAll 			= [];
	this.state 					= "bet";
	this.cards 					= [];
	this.dealerCardsSum 		= 0;
	this.dealerCardsNumber 		= 0;
	this.dealerCards 			= [];
	this.betTime 				= 10000;
	this.thisStartTime 			= currentTime;
	this.timeBetweenCardsDeal 	= 800;
	this.controlDealTime 		= currentTime;
	this.isCardForDealer 		= false;
	this.isRoundStarted 		= false;
	this.cardsStack 			= auxiliaryRequire.getCardsStack();
	this.timeToThink 			= 15000;
	this.currentPlayerTime 		= currentTime;
	this.dealerX 				= 675;
	this.dealerY 				= 80;
	this.afterGameControlTime 	= currentTime;
	this.afterGameTime 			= 3000;
	this.timer 					= 0;
	this.dealerHowManyAces		= 0;
	this.seats					= [false, false, false, false, false];
}



Room.prototype.createPlayer = function(player) {
	player.cardsNumber = 0;
	player.howManyAces = 0;
	player.action = "none";
	player.cardsSum = 0;
	player.pointsBet = 0;
	player.cards = [];
	player.gameResult = "none";
	player.insurence = false;
	player.insurencePoints = 0;
	player.doubleAction = false;
	player.doubleActionAndBust = false;

	player.split = false;
	player.hand = "right";
	player.splitProperties = {
		cardsSum: 0,
		cardsNumber: 0,
		howManyAces: 0,
		cards: [],
		pointsBet: 0,
		gameResult: "none",
		inGame: true,
		doubleAction: false,
		doubleActionAndBust: false
	}

	player.seat = this.seats.indexOf(false);
	if(player.seat !== -1) {
		this.seats[player.seat] = true;
		player.x = 1080 - 202.5 * player.seat;
		switch(player.seat) {
			case 4:
			case 0:
				player.y = 230;
				break;
			case 3:
			case 1:
				player.y = 430;
				break;
			case 2:
				player.y = 470; 
				break;
		}
		
		this.playersAll.push(player);
		this.usersNum += 1;
	}
}

Room.prototype.findPlayerById = function(id) {
	for(var i = 0; i < this.playersAll.length; i++) {
		if(this.playersAll[i].id == id) {
			return this.playersAll[i];
		};
	}
	return undefined; 
};


Room.prototype.startLoop = function(io, roomIntervals) {
	var intervalId = auxiliaryRequire.randomId();
	this.interval = intervalId;

	this.changeState(this.bet);
	var self = this;
	var interval = setInterval(function() {
		self.gameLoop(io);
	}, 250);
	
	roomIntervals[intervalId] = interval;
}

Room.prototype.playersInGame = function() {
	var result = 0;
	for(var i = 0; i < this.players.length; i++) {
		if(this.players[i].inGame) result++;
	}
	return result;
}

Room.prototype.splitPlayersInGame = function() {
	var result = 0;
	for(var i = 0; i < this.players.length; i++) {
		if(this.players[i].splitProperties.inGame && this.players[i].split) result++;
	}
	return result;
}

Room.prototype.randomCardFromStack = function(cardForDealer) {
	//var cardIndex = Math.floor(Math.random() * this.cardsStack.length);
	var cardIndex = this.cardsStack.length - 1;
	var card = this.cardsStack[cardIndex];
	console.log("Card: " + JSON.stringify(card) + "    CardIndex = " + cardIndex + "    CardsStack.length = " + this.cardsStack.length);
	this.cardsStack.splice(cardIndex, 1);
	return ({
		id: 	auxiliaryRequire.randomId(),
  		type: 	card.type,
		x: 		1150,
		y: 		60,
		goalX: 	(cardForDealer ? this.dealerX + this.dealerCardsNumber * 20 : this.currentPlayer.x + this.currentPlayer.cardsNumber * 15),
		goalY: 	(cardForDealer ? this.dealerY : this.currentPlayer.y - this.currentPlayer.cardsNumber * 20),
		value: 	card.value
	});
}

Room.prototype.userDisconnected = function(io, playerId) {
	if(this.currentPlayer.id == playerId) {
		if(this.players.length === 1) {
			this.afterGameControlTime = (new Date()).getTime();
			this.changeState(this.afterGame);
		} else {
			this.changeCurrentPlayer(false);
		}
	}

	this.seats[this.findPlayerById(playerId).seat] = false;


	for(var i = 0; i < this.players.length; i++) {
		if(this.players[i].id == playerId) {
			this.players.splice(i, 1);
			break;
		}
	}

	if(this.players.length <= 0 && this.state != "bet") {
		this.afterGameControlTime = (new Date()).getTime();
		this.changeState(this.afterGame);
	}

}

Room.prototype.hit = function(now) {
	this.currentPlayer.action = "none";
	this.drawCard(false);
	this.currentPlayerTime = now;
	if(this.playersInGame() === 0) {
		this.controlDealTime = now;
		this.changeState(this.dealersTurn);
	} else {
		this.currentPlayer.action = "none";
	}
}

Room.prototype.stand = function(now) {
	this.currentPlayer.action = "none";
	this.currentPlayerTime = now;
	if(this.currentPlayer.split && this.currentPlayer.hand === "right") {
		this.currentPlayer.hand = "left";
		this.currentPlayer.splitProperties.inGame = (this.currentPlayer.splitProperties.doubleActionAndBust ? false : true);
	} else {
		this.isRoundStarted = true;
		this.changeCurrentPlayer((this.currentPlayer.doubleActionAndBust ? false : true));
	}
}

Room.prototype.split = function(now) {
	this.currentPlayer.action = "none";
	if(this.currentPlayer.overallPoints >= this.currentPlayer.pointsBet && this.currentPlayer.cardsNumber === 2 
		&& this.currentPlayer.cards[0].value === this.currentPlayer.cards[1].value) {
		this.currentPlayerTime = now;
		this.currentPlayer.cards[0].goalX -= 40;
		this.currentPlayer.cards[1].goalX = this.currentPlayer.cards[0].goalX + 80;
		this.currentPlayer.cards[1].goalY += 20;

		this.currentPlayer.split = true;
		this.currentPlayer.cardsNumber = 1;
		this.currentPlayer.splitProperties.cardsNumber = 1;
		this.currentPlayer.splitProperties.cards.push(this.currentPlayer.cards.pop());
		this.currentPlayer.splitProperties.howManyAces = (this.currentPlayer.splitProperties.cards[0].value === 11 ? 1 : 0);
		this.currentPlayer.howManyAces = (this.currentPlayer.cards[0].value === 11 ? 1 : 0);
		this.currentPlayer.splitProperties.cardsSum = this.currentPlayer.splitProperties.cards[0].value;
		this.currentPlayer.cardsSum = this.currentPlayer.cards[0].value;
		this.currentPlayer.splitProperties.pointsBet = this.currentPlayer.pointsBet;
		this.currentPlayer.overallPoints -= this.currentPlayer.pointsBet;
	}	
}

Room.prototype.insurence = function(now) {
	this.currentPlayer.action = "none";
	if(!this.currentPlayer.insurence && this.dealerCards[0].value === 11 
		&& this.currentPlayer.overallPoints >= this.currentPlayer.pointsBet 
		&& this.currentPlayer.cardsNumber === 2 && !this.currentPlayer.split) {
		this.currentPlayerTime = now;
		this.currentPlayer.insurence = true;
		this.currentPlayer.insurencePoints = this.currentPlayer.pointsBet;
		this.currentPlayer.overallPoints -= this.currentPlayer.pointsBet;
		console.log("insurence");
	}
}

Room.prototype.double = function(now) {
	this.currentPlayer.action = "none";
	if(this.currentPlayer.overallPoints >= this.currentPlayer.pointsBet) {
		if(this.currentPlayer.split && this.currentPlayer.hand == "right") {
			this.currentPlayer.splitProperties.doubleAction = true;
			this.currentPlayer.overallPoints -= this.currentPlayer.splitProperties.pointsBet;
			this.currentPlayer.splitProperties.pointsBet *= 2;
		} else {
			this.currentPlayer.doubleAction = true;
			this.currentPlayer.overallPoints -= this.currentPlayer.pointsBet;
			this.currentPlayer.pointsBet *= 2;
		}
		this.hit(now);
		this.stand(now);
	}
}

Room.prototype.drawCard = function(cardForDealer) {
	var card = this.randomCardFromStack(cardForDealer);
	if(cardForDealer) {		
		this.cards.push(card);
		this.dealerCardsSum += card.value;
		this.dealerCardsNumber += 1;
		this.dealerCards.push(card);
		if(card.value === 11) this.dealerHowManyAces += 1;
		if(this.dealerCardsSum > 21 && this.dealerHowManyAces > 0) {
			this.dealerCardsSum -= 10;
			--this.dealerHowManyAces;
		}
	} else {
		if(this.currentPlayer.split && this.currentPlayer.hand === "right") {
			card.goalX = this.currentPlayer.x + this.currentPlayer.splitProperties.cardsNumber * 15 + 40;
			card.goalY = this.currentPlayer.y - this.currentPlayer.splitProperties.cardsNumber * 20;
			this.cards.push(card);
			this.currentPlayer.splitProperties.cards.push(card);
			this.currentPlayer.splitProperties.cardsSum += card.value;
			this.currentPlayer.splitProperties.cardsNumber += 1;
			if(card.value === 11) this.currentPlayer.splitProperties.howManyAces += 1;
			if(this.currentPlayer.splitProperties.cardsSum > 21) {
				if(this.currentPlayer.splitProperties.howManyAces > 0) {
					this.currentPlayer.splitProperties.cardsSum -= 10;
					--this.currentPlayer.splitProperties.howManyAces;
				} else if(!this.currentPlayer.splitProperties.doubleAction) {
					this.currentPlayer.hand = "left";
					this.currentPlayer.splitProperties.inGame = false;
				} else {
					this.currentPlayer.splitProperties.doubleActionAndBust = true;
				}
			}
		} else {
			if(this.currentPlayer.split && this.currentPlayer.hand === "left") {
				card.goalX -= 40;
			}
			this.cards.push(card);
			this.currentPlayer.cards.push(card);
			this.currentPlayer.cardsSum += card.value;
			this.currentPlayer.cardsNumber += 1;
			if(card.value === 11) this.currentPlayer.howManyAces += 1;
			if(this.currentPlayer.cardsSum > 21) {
				if(this.currentPlayer.howManyAces > 0) {
					this.currentPlayer.cardsSum -= 10;
					--this.currentPlayer.howManyAces;
				} else if(!this.currentPlayer.doubleAction) {
					this.changeCurrentPlayer(false);	
				} else {
					this.currentPlayer.doubleActionAndBust = true;
				}
			}
		}
	}
}

Room.prototype.changeCurrentPlayer = function(playerInGame) {
	var index = this.players.indexOf(this.currentPlayer);
	index++;
	if(index > this.players.length - 1) {
		index = 0;
	}
	this.currentPlayer.inGame = playerInGame;
	this.currentPlayer = this.players[index];
	this.currentPlayerTime = (new Date()).getTime();
}

Room.prototype.changeState = function(loopState) {
	this.loopState = loopState;
}

Room.prototype.bet = new GameState(function(room) {
	var now = (new Date()).getTime();
	room.state = "bet";
	room.timer = Math.ceil((room.betTime - (now - room.thisStartTime))/1000);
		if(now - room.thisStartTime > room.betTime) {
			room.players = [];
			for(var i = 0; i < room.playersAll.length; i++){
				if(room.playersAll[i].pointsBet > 0) {
					room.playersAll[i].inGame = true;
					room.playersAll[i].overallPoints -= room.playersAll[i].pointsBet;
					room.players.push(room.playersAll[i]);
				}
			}

			if(room.playersInGame() <= 0) {
				room.thisStartTime = now;
			} else {
				room.players.sort(function(a, b) {return a.seat - b.seat});
				room.changeState(room.deal);
				room.currentPlayer = room.players[0];
			}

		}
		room.controlDealTime = now;
});

Room.prototype.deal = new GameState(function(room) {
	var now = (new Date()).getTime();
	room.state = "deal";
	timer = 0;
		if(now - room.controlDealTime > room.timeBetweenCardsDeal) {
			room.controlDealTime = now;
			if(room.isCardForDealer) {
				room.isCardForDealer = false;
				room.drawCard(true);
			} else {
				if(room.players.indexOf(room.currentPlayer) === room.players.length - 1) {
					room.isCardForDealer = true;
				}
				room.drawCard(false);
				room.changeCurrentPlayer(true);
			}			
		}
		if(room.players.indexOf(room.currentPlayer) === 0 && room.currentPlayer.cardsNumber == 2){
			room.changeState(room.game);
			room.currentPlayerTime = (new Date()).getTime();
		}
});

Room.prototype.game = new GameState(function(room) {
	var now = (new Date()).getTime();
	room.state = "game";
	if(room.currentPlayer.action === "hit") {
			room.hit(now);
	} else 
		if(room.currentPlayer.action === "stand") {
				room.stand(now);
		} else 
			if(room.currentPlayer.action === "double") {
				room.double(now);
		} else
		 	if(room.currentPlayer.action === "split" && !room.currentPlayer.split) {
			 	room.split(now);
		} else
		 	if(room.currentPlayer.action === "insurence") {
			 	room.insurence(now);
			}
		room.timer = Math.ceil((room.timeToThink - (now - room.currentPlayerTime))/1000);

		if(room.players.indexOf(room.currentPlayer) === 0 && room.isRoundStarted){
			room.controlDealTime = now - room.timeBetweenCardsDeal/2;
			room.changeState(room.dealersTurn);
		} else if(now - room.currentPlayerTime > room.timeToThink || room.currentPlayer.cardsSum === 21){
			room.controlDealTime = now - room.timeBetweenCardsDeal/2;
			room.currentPlayerTime = now;
			room.changeCurrentPlayer(true);	
			room.isRoundStarted = true;
		} else if(room.currentPlayer.splitProperties.cardsSum === 21) {
			room.currentPlayer.hand = "left";
			room.currentPlayer.splitProperties.inGame = true;
		}
});

Room.prototype.pointsReward = function(room, player, condition, conditionSplit) {
	if(player.insurence && room.dealerCards[0].value === 11 && room.dealerCardsSum === 21 && room.dealerCardsNumber === 2) {
		player.overallPoints += 2 * player.insurencePoints;
	}


	player.gameResult = "lose";
	if(player.inGame) {
		if(condition) {
			room.increasedRewardWhenBlackjack(room, player, function(player) {
				player.overallPoints += 2 * player.pointsBet;
				player.gameResult = "win";
			});
		} else if(player.cardsSum === room.dealerCardsSum) {
			room.increasedRewardWhenBlackjack(room, player, function(player) {
				player.overallPoints += player.pointsBet;
				player.gameResult = "push";
			});
		}
	}
	if(player.split) {
		player.splitProperties.gameResult = "lose";
		if(player.splitProperties.inGame) {
			if(conditionSplit) {
				room.increasedRewardWhenBlackjackSplit(room, player, function(player) {
					player.overallPoints += 2 * player.splitProperties.pointsBet;
					player.splitProperties.gameResult = "win";
				});
			} else if(player.splitProperties.cardsSum === room.dealerCardsSum) {
				room.increasedRewardWhenBlackjackSplit(room, player, function(player) {
					player.overallPoints += player.splitProperties.pointsBet;
					player.splitProperties.gameResult = "push";
				});
			}
		}
	}
}

Room.prototype.increasedRewardWhenBlackjack = function(room, player, callback) {
	if(player.cardsSum === 21 && player.cardsNumber === 2 
		&& (player.cardsNumber < room.dealerCardsNumber || room.dealerCardsSum !== 21) && !player.split) {
		player.overallPoints += Math.floor(3/2 * player.pointsBet) + player.pointsBet;
		player.gameResult = "win";
	} else {
		callback(player);
	}
}

Room.prototype.increasedRewardWhenBlackjackSplit = function(room, player, callback) {
	if(player.split) {
		if(player.splitProperties.cardsSum === 21 && player.splitProperties.cardsNumber === 2 
			&& (player.splitProperties.cardsNumber < room.dealerCardsNumber || room.dealerCardsSum !== 21) && !player.split) {
			player.overallPoints += Math.floor(3/2 * player.splitProperties.pointsBet) + player.splitProperties.pointsBet;
			player.splitProperties.gameResult = "win";
		} else {
			callback(player);
		}
	}
}

Room.prototype.dealersTurn = new GameState(function(room) {
	var now = (new Date()).getTime();
	room.state = "dealersTurn";
	timer = 0;
		if(now - room.controlDealTime > room.timeBetweenCardsDeal) {
			room.controlDealTime = now;
			if(room.dealerCardsSum < 17 && (room.playersInGame() !== 0 || room.splitPlayersInGame() !== 0)) {
				room.drawCard(true);
				if(room.dealerCardsSum > 21) {
					for(var i = 0; i < room.players.length; i++) {
						var player = room.players[i];
						room.pointsReward(room, player, true, true);
					}
					room.changeState(room.afterGame);
					room.afterGameControlTime = now;
				}
			} else {
				for(var i = 0; i < room.players.length; i++) {
					var player = room.players[i];
					// console.log(player.cardsSum + " " + room.dealerCardsSum + " " + player.cardsNumber + " " + room.dealerCardsNumber);
					room.pointsReward(room, player, player.cardsSum > room.dealerCardsSum, 
						player.splitProperties.cardsSum > room.dealerCardsSum);
				}
				room.changeState(room.afterGame);
				room.afterGameControlTime = now;
			}	
		}
	});


Room.prototype.afterGame = new GameState(function(room) {
	var now = (new Date()).getTime();
	room.state = "afterGame";
	room.timer = Math.ceil((room.afterGameTime - (now - room.afterGameControlTime))/1000);
		if(now - room.afterGameControlTime > room.afterGameTime) {
			room.afterGameControlTime = now;
			room.changeState(room.reset);
			//io.to(room.id).emit('reset');
		}
});


Room.prototype.reset = new GameState(function(room) {
	var now = (new Date()).getTime();
	room.state = "reset";
	room.cards = [];
		for(var i = 0; i < room.players.length; i++) {
			room.players[i].pointsBet = 0;
			room.players[i].cardsNumber = 0;
			room.players[i].cardsSum = 0;
			room.players[i].action = "none";
			room.players[i].howManyAces = 0;
			room.players[i].cards = [];
			room.players[i].gameResult = "none";
			room.players[i].insurence = false;
			room.players[i].insurencePoints = 0;
			room.players[i].doubleAction = false;
			room.players[i].doubleActionAndBust = false;

			room.players[i].split = false;
			room.players[i].hand = "right";
			room.players[i].splitProperties = {
				cardsSum: 0,
				cardsNumber: 0,
				howManyAces: 0,
				cards: [],
				pointsBet: 0,
				gameResult: "none",
				inGame: true,
				doubleAction: false,
				doubleActionAndBust: false
			}
		}
		room.changeState(room.bet);
		room.currentPlayer = 0;
		room.dealerCardsSum = 0;
		room.dealerCardsNumber = 0;
		room.dealerCards = [];
		room.thisStartTime = (new Date()).getTime();
		room.controlDealTime = (new Date()).getTime(),
		room.isCardForDealer = false;
		room.isRoundStarted = false;
		if(room.cardsStack.length <= 100) room.cardsStack = auxiliaryRequire.getCardsStack();
		room.currentPlayerTime = (new Date()).getTime();
		room.dealerHowManyAces = 0;
});


Room.prototype.gameLoop = function(io) {
	this.loopState.execute(this);

	io.to(this.id).emit('update', {
		cards: this.cards,
		players: this.playersAll,
		dealerCardsSum: this.dealerCardsSum,
		timer: this.timer,
		currentPlayer: this.currentPlayer,
		state: this.state
	});

	for(var i = 0; i < this.cards.length; i++) {
		this.cards[i].x = this.cards[i].goalX;
		this.cards[i].y = this.cards[i].goalY;
	}
	//console.log("Game state: " + this.state + "   currentPlayer: " + this.currentPlayer.name);
}
