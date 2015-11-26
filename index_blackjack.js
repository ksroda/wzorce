var auxiliaryRequire = require('./index_auxiliary.js');

var blackjack = {
	rooms: {}
}

blackjack.createRoom = function(io, roomName, roomIntervals) {
	var room = new Room(roomName, (new Date).getTime());
	room.startLoop(io, roomIntervals);
	this.rooms[room.id] = room;
}

//-----------------------------------------------------------------Socket---------------------------------------------------

blackjack.setOnActionChange = function(socket) {
	var self = this;
	socket.on('actionButton', function(action) {
		if(self.rooms[socket.roomId]) {
			var currentPlayer = self.rooms[socket.roomId].currentPlayer;
			if(currentPlayer.id === socket.id) {
				currentPlayer.action = action;
			}
		}
	});
}

module.exports = blackjack;

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
	this.betTime 				= 5000;
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
	player.pointsBet = 100;

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


Room.prototype.startLoop = function(io, roomIntervals) {
	var intervalId = auxiliaryRequire.randomId();
	this.interval = intervalId;

	var self = this;
	var interval = setInterval(function() {
		self.gameLoop(io);
	}, 500);
	
	roomIntervals[intervalId] = interval;
}

Room.prototype.playersInGame = function() {
	var result = 0;
	for(var i = 0; i < this.players.length; i++) {
		if(this.players[i].inGame) result++;
	}
	return result;
}

Room.prototype.randomCardFromStack = function() {
	//var cardIndex = Math.floor(Math.random() * this.cardsStack.length);
	var cardIndex = this.cardsStack.length - 1;
	var card = this.cardsStack[cardIndex];
	console.log("Card: " + JSON.stringify(card) + "    CardIndex = " + cardIndex + "    CardsStack.length = " + this.cardsStack.length);
	this.cardsStack.splice(cardIndex, 1);
	return ({
		id: 	auxiliaryRequire.randomId(),
  		type: 	card.type,
		x: 		1200,
		y: 		100,
		goalX: 	this.currentPlayer.x + this.currentPlayer.cardsNumber * 25,
		goalY: 	this.currentPlayer.y,
		value: 	card.value
	});
}

Room.prototype.userDisconnected = function(playerId) {
	if(this.currentPlayer.id === playerId) {
		var index = this.players.indexOf(this.currentPlayer);
		index++;
		if(index > this.players.length - 1) {
			index = 0;
		}
		this.players[this.players.indexOf(this.currentPlayer)].inGame = false;
		this.currentPlayer = this.players[index];
	}

	for(var i = 0; i < this.players.length; i++) {
		if(this.players[i].id === playerId) {
			this.seats[this.players[i].seat] = false;
			this.players.splice(i, 1);
			break;
		}
	}

	if(this.players.length <= 0) {
		this.state = "afterGame";
	}

}

Room.prototype.gameLoop = function(io) {
	var now = (new Date()).getTime();
	switch(this.state) {
		case "bet":
			this.timer = Math.ceil((this.betTime - (now - this.thisStartTime))/1000);
			if(now - this.thisStartTime > this.betTime) {
				this.players = [];
				for(var i = 0; i < this.playersAll.length; i++){
					if(this.playersAll[i].pointsBet > 0){
						this.playersAll[i].inGame = true;
						this.playersAll[i].overallPoints -= this.playersAll[i].pointsBet;
						this.players.push(this.playersAll[i]);
					}
				}
				this.players.sort(function(a, b) {return a.seat - b.seat});
				this.state = "deal";
				this.currentPlayer = this.players[0];
			}
			this.controlDealTime = now;
			break;
		case "deal":
			timer = 0;
			if(now - this.controlDealTime > this.timeBetweenCardsDeal) {
				this.controlDealTime = now;
				var card = this.randomCardFromStack();
				this.cards.push(card);
				if(this.isCardForDealer){
					this.cards[this.cards.length -1].goalX = this.dealerX + this.dealerCardsNumber * 25;
					this.cards[this.cards.length -1].goalY = this.dealerY;			
					this.dealerCardsSum += card.value;
					if(card.value === 11) this.dealerHowManyAces += 1;
					this.dealerCardsNumber += 1;
					this.isCardForDealer = false;
				} else {
					this.currentPlayer.cardsSum += card.value;
					if(card.value === 11) this.currentPlayer.howManyAces += 1;
					if(this.currentPlayer.cardsSum > 21 && this.currentPlayer.howManyAces > 0) {
						this.currentPlayer.cardsSum -= 10;
						--this.currentPlayer.howManyAces;
					}
					this.currentPlayer.cardsNumber += 1;
					if(this.currentPlayer.id === this.players[this.players.length - 1].id) {
						this.isCardForDealer = true;
					}
					var index = this.players.indexOf(this.currentPlayer);
					index++;
					if(index > this.players.length - 1) {
						index = 0;
					}
					this.currentPlayer = this.players[index];
				}			
			}
			if(this.players.indexOf(this.currentPlayer) === 0 && this.currentPlayer.cardsNumber == 2){
				this.state = "game";
			} else {
				break;
			}
			this.currentPlayerTime = (new Date()).getTime();
		case "game":
			switch (this.currentPlayer.action){
				case "hit":
					var card = this.randomCardFromStack();
					this.cards.push(card);
					this.currentPlayer.cardsSum += card.value;

					if(card.value === 11) this.currentPlayer.howManyAces += 1;
					if(this.currentPlayer.cardsSum > 21 && this.currentPlayer.howManyAces > 0) {
						this.currentPlayer.cardsSum -= 10;
						--this.currentPlayer.howManyAces;
					}

					this.currentPlayer.cardsNumber += 1;
					if(this.currentPlayer.cardsSum > 21){
						var index = this.players.indexOf(this.currentPlayer);
						index++;
						if(index > this.players.length - 1) {
							index = 0;
						}
						this.players[this.players.indexOf(this.currentPlayer)].inGame = false;
						this.currentPlayer = this.players[index];
						//this.players.splice(this.players.indexOf(this.currentPlayer), 1);
						

					}
					this.currentPlayerTime = now;
					if(this.playersInGame() === 0) {
						this.controlDealTime = now;
						this.state = "dealersTurn";
						break;
					} else {
						this.currentPlayer.action = "none";
					}
					break;
				case "stand":
					var index = this.players.indexOf(this.currentPlayer);
					index++;
					if(index > this.players.length - 1) {
						index = 0;
					}
					this.currentPlayer = this.players[index];
					this.isRoundStarted = true;
					this.currentPlayerTime = now;
					break;
				case "split":	
					//TODO
					break;
				case "double":
					//TODO
					break;
			}
			this.timer = Math.ceil((this.timeToThink - (now - this.currentPlayerTime))/1000);
			if(now - this.currentPlayerTime > this.timeToThink || this.currentPlayer.cardsSum === 21){
				this.controlDealTime = now - this.timeBetweenCardsDeal/2;
				this.currentPlayerTime = now;
				var index = this.players.indexOf(this.currentPlayer);
				index++;
				if(index > this.players.length - 1) {
					index = 0;
				}
				this.currentPlayer = this.players[index];	
				this.isRoundStarted = true;
			}
			if(this.players.indexOf(this.currentPlayer) === 0 && this.isRoundStarted){
				this.controlDealTime = now - this.timeBetweenCardsDeal/2;
				this.state = "dealersTurn";
			}
			else{
				break;
			}
		case "dealersTurn":
			timer = 0;
			if(now - this.controlDealTime > this.timeBetweenCardsDeal) {
				this.controlDealTime = now;
				if(this.dealerCardsSum < 17 ) {
					var card = this.randomCardFromStack();
					card.goalX = this.dealerX + this.dealerCardsNumber * 25;
					card.goalY = this.dealerY;	
					this.cards.push(card);
					this.dealerCardsSum += card.value;

					if(card.value === 11) this.dealerHowManyAces += 1;
					if(this.dealerCardsSum > 21 && this.dealerHowManyAces > 0) {
						this.dealerCardsSum -= 10;
						--this.dealerHowManyAces;
					}

					this.dealerCardsNumber += 1;
					if(this.dealerCardsSum > 21) {
						for(var i = 0; i < this.players.length; i++) {
							if(this.players[i].inGame) {
								this.players[i].overallPoints += 2 * this.players[i].pointsBet;
							} else {
								this.players[i].overallPoints += this.players[i].pointsBet;
							}
						}
						this.state = "afterGame";
						this.afterGameControlTime = now;
					}
				} else {
					for(var i = 0; i < this.players.length; i++) {
						if(this.players[i].inGame) {
							if(this.players[i].cardsSum > this.dealerCardsSum) {
								this.players[i].overallPoints += 2 * this.players[i].pointsBet;
							} else if(this.players[i].cardsSum === this.dealerCardsSum) {
								this.players[i].overallPoints += this.players[i].pointsBet;
							}
						}
					}
					this.state = "afterGame";
					this.afterGameControlTime = now;
				}	
			}
			break;
		case "afterGame":
			this.timer = Math.ceil((this.afterGameTime - (now - this.afterGameControlTime))/1000);
			if(now - this.afterGameControlTime > this.afterGameTime) {
				this.afterGameControlTime = now;
				this.state = "reset";
				io.to(this.id).emit('reset');
			}
			break;
		case "reset":
			//delete this.cards;
			this.cards = [];
			//this.players = [];
			for(var i = 0; i < this.players.length; i++) {
				this.players[i].pointsBet = 100;
				this.players[i].cardsNumber = 0;
				this.players[i].cardsSum = 0;
				this.players[i].action = "none";
				this.players[i].howManyAces = 0;
			}
			this.state = "bet";
			this.currentPlayer = 0;
			this.dealerCardsSum = 0;
			this.dealerCardsNumber = 0;
			this.thisStartTime = (new Date()).getTime();
			this.controlDealTime = (new Date()).getTime(),
			this.isCardForDealer = false;
			this.isRoundStarted = false;
			if(this.cardsStack.length <= 100) this.cardsStack = auxiliaryRequire.getCardsStack();
			this.currentPlayerTime = (new Date()).getTime();
			this.dealerHowManyAces = 0;
			break;
	}

	io.to(this.id).emit('update', {
		room: this
	});

	for(var i = 0; i < this.cards.length; i++) {
		this.cards[i].x = this.cards[i].goalX;
		this.cards[i].y = this.cards[i].goalY;
	}
}