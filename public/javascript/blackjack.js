if(!userAllowedToEnterGame) {
	window.location = "#/";
};

//------------------------------------Phraser-------------------------------------------
var game = new Phaser.Game(1350, 700, Phaser.CANVAS, 'phaser', { preload: preload, create: create, update: update }, true);
var cardsGroup;
var statusGroup;

var cards = {};
var style = { font: "18px Arial", fill: "#FFFFFF", align: "center" };
var timer;
var dealerCardsSum;
var userInfo = {};
var myId;
var arrow;
var currentPlayerPointer;
var currentPlayer;
var gameState = "bet";

//-----------------------------------Observer-------------------------------------------
function Observer(func) {
	this.update = func;
}

function ObserverList(){
	this.observerList = [];
}
 
ObserverList.prototype.add = function(obj){
	return this.observerList.push(obj);
};

ObserverList.prototype.count = function(){
	return this.observerList.length;
};

ObserverList.prototype.get = function(index){
	if(index >= 0 && index < this.observerList.length){
    	return this.observerList[index];
  	}
};
 
ObserverList.prototype.indexOf = function(obj, startIndex){
	var i = startIndex;
 	while( i < this.observerList.length ){
 		if( this.observerList[i] === obj ){
 			return i;
 		}
 		i++;
 	}
 	return -1;
};
 
ObserverList.prototype.removeAt = function(index){
	this.observerList.splice(index, 1);
};


function Subject(){
	this.observers = new ObserverList();
}
 
Subject.prototype.addObserver = function(observer){
	this.observers.add(observer);
};
 
Subject.prototype.removeObserver = function(observer){
	this.observers.removeAt(this.observers.indexOf(observer, 0) );
};
 
Subject.prototype.notify = function(context){
	var observerCount = this.observers.count();
	for(var i = 0; i < observerCount; i++) {
		this.observers.get(i).update(context);
	}
};

var subject = new Subject();

subject.addObserver(new Observer(function(data) {
	for(var i = 0; i < data.cards.length; i++) {
		if(!cards[data.cards[i].id]) {
			createCard(data.cards[i]);
		} else {
			cards[data.cards[i].id].updateGoal(data.cards[i]);
		}
	}
}));

subject.addObserver(new Observer(function(data) {
	for(var i = 0; i < data.players.length; i++) {
		if(!userInfo[data.players[i].id]) {
			userInfo[data.players[i].id] = new UserInfo(data.players[i]);
		} else {
			userInfo[data.players[i].id].update(data.players[i]);
		}
	}
}));

subject.addObserver(new Observer(function(data) {
	if(timer) timer.setText(data.timer);
	if(dealerCardsSum) dealerCardsSum.setText(data.dealerCardsSum);
	currentPlayer = data.currentPlayer;
}));

subject.addObserver(new Observer(function(data) {
	gameState = data.state;
	if(gameState === "bet") {
			$(".actionButtons").fadeOut();
			$(".betButtons").fadeIn();
		} else {
			$(".actionButtons").fadeIn();
			$(".betButtons").fadeOut();
		}
}));


subject.addObserver(new Observer(function(data) {
	if(gameState == "reset") {
		for(var x in cards) {
			cards[x].kill();
		}
		cards = [];
	}
}));

function preload() {

}

var loadingText;

function create() {
	// game.load.onLoadStart.add(loadStart, this);
	game.load.onLoadComplete.add(loadComplete, this);
	var style = { font: "30px Arial", fill: "#FFFFFF", align: "center" };
	loadingText = game.add.text(675, 280, "Loading...", style);
	loadingText.anchor.set(0.5, 0.5);
	startLoading();
}

function startLoading() {
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
	//game.load.image("title", "assets/title.png");

	game.load.spritesheet("status", "assets/status.png", 109, 33, 4);

	game.load.start();
}

function loadComplete() {
	// $("canvas").hide();
	loadingText.setText("");
	game.time.desiredFps = 30;


	var table = game.add.sprite(675, 280, "table");
	game.physics.startSystem(Phaser.Physics.ARCADE);
	cardsGroup = game.add.group();
	
	timer = game.add.text(50, 50, "", style);
	dealerCardsSum = game.add.text(600, 80, "", style);
	
	//table.scale.setTo(0.6, 0.6);
	table.anchor.set(0.5, 0.5);
	timer.anchor.set(0.5, 0.5);
	dealerCardsSum.anchor.set(0.5, 0.5);

	//arrow = game.add.sprite(675, 30, "arrow");
	//arrow.anchor.set(0.45, 0.5);
	//arrow.scale.setTo(0.5, 0.5);

	currentPlayerPointer = game.add.sprite(1080, 290, "arrow");
	game.physics.enable(currentPlayerPointer, Phaser.Physics.ARCADE);
	currentPlayerPointer.body.allowRotation = false;
	currentPlayerPointer.anchor.set(0.5, 0.5);
	currentPlayerPointer.scale.setTo(0.1, 0.1);
	statusGroup = game.add.group();

	//sendWelcome("testowy"); //Na czas testów
	gameLoaded = true;
}

function update() {
	if(gameLoaded) {
		for(var i in cards) {
			cards[i].move();
		}

		if(currentPlayer && currentPlayerPointer && gameState == "game") {
			var temp = game.input.activePointer;
			temp.x = currentPlayer.x;
			temp.y = currentPlayer.y + 60;
			if(currentPlayer.split) {
				if(currentPlayer.hand === "right") {
					temp.x = currentPlayer.x + 40;
				} else {
					temp.x = currentPlayer.x - 40;
				}
			}
			game.physics.arcade.moveToPointer(currentPlayerPointer, 50, temp, 300);
		} else {
			var temp = game.input.activePointer;
			temp.x = 675;
			temp.y = 220;
			game.physics.arcade.moveToPointer(currentPlayerPointer, 50, temp, 300);
		}

	}
	
	
}

function createCard(card) {
	cards[card.id] = new DecoratedCard(cardsGroup.create(card.x, card.y, card.type), card);
	// anchor.set(0,0) -> współrzędne obrazka w jego lewym górnym rogu
	// anchor.set(0.5,0.5) -> współrzędne obrazka w jego środku
	cards[card.id].anchor.set(0.5, 0.5);
	game.physics.enable(cards[card.id], Phaser.Physics.ARCADE);
}

function UserInfo(player) {
	//this.nameBackground = statusGroup.create(player.x, player.y + 110, "title");
	this.name = game.add.text(player.x, player.y + 100, player.name, style);
	this.cardsSum = game.add.text(player.x - 80, player.y + 20, player.cardsSum, style);
	this.pointsBet = game.add.text(player.x, player.y + 80, player.pointsBet, style);
	if(player.id === myId) this.overallPoints = game.add.text(100, 600, "Overall points: " + player.overallPoints, style);
	this.status = statusGroup.create(player.x - 80, player.y - 10, "status");
	this.status.anchor.set(0.5, 0.5);
	this.status.scale.setTo(0.6, 0.6);

	this.status.animations.add('win', [2], 1, false);
	this.status.animations.add('lose', [1], 1, false);
	this.status.animations.add('push', [0], 1, false);
	this.status.animations.add('none', [3], 1, false);
	this.status.animations.play('none');

	//this.nameBackground.anchor.set(0.5, 0.5);
	//this.nameBackground.scale.setTo(0.6, 0.6);

	this.name.anchor.set(0.5, 0.5);
	this.cardsSum.anchor.set(0.5, 0.5);
	this.pointsBet.anchor.set(0.5, 0.5);


	this.splitProperties = {
		cardsSum: game.add.text(player.x + 120, player.y + 20, "", style),
		pointsBet: game.add.text(player.x + 40, player.y + 80, "", style),
		status: statusGroup.create(player.x + 120, player.y - 10, "status")
	}

	this.splitProperties.status.anchor.set(0.5, 0.5);
	this.splitProperties.status.scale.setTo(0.6, 0.6);
	this.splitProperties.status.animations.add('win', [2], 1, false);
	this.splitProperties.status.animations.add('lose', [1], 1, false);
	this.splitProperties.status.animations.add('push', [0], 1, false);
	this.splitProperties.status.animations.add('none', [3], 1, false);
	this.splitProperties.status.animations.play('none');

	this.splitProperties.cardsSum.anchor.set(0.5, 0.5);
	this.splitProperties.pointsBet.anchor.set(0.5, 0.5);
}

UserInfo.prototype.update = function(player) {
	this.name.setText(player.name);
	this.cardsSum.setText(player.howManyAces > 0 ? player.cardsSum + "/" + (player.cardsSum - 10) : player.cardsSum);
	this.pointsBet.setText(player.pointsBet);
	if(player.id === myId) this.overallPoints.setText("Overall points: " + player.overallPoints);
	this.status.animations.play(player.gameResult);
	
	if(player.split) {
		this.splitProperties.cardsSum.setText(player.splitProperties.howManyAces > 0 ? player.splitProperties.cardsSum + 
			"/" + (player.splitProperties.cardsSum - 10) : player.splitProperties.cardsSum);
		this.cardsSum.x = player.x - 120;
		this.status.x = player.x - 120;
		this.pointsBet.x = player.x - 40;
		this.splitProperties.pointsBet.setText(player.splitProperties.pointsBet);
		this.splitProperties.status.animations.play(player.splitProperties.gameResult);
	} else {
		this.cardsSum.x = player.x - 80;
		this.status.x = player.x - 80;
		this.pointsBet.x = player.x;
		this.splitProperties.pointsBet.setText("");
		this.splitProperties.cardsSum.setText("");
		this.splitProperties.status.animations.play('none');
	}
}


function DecoratedCard(cardObject, cardProperties) {
	cardObject.properties = {
		value: cardProperties.value,
		goalX: cardProperties.goalX,
		goalY: cardProperties.goalY
	};

	cardObject.move = function() {
		var temp = game.input.activePointer;
		temp.x = this.properties.goalX;
		temp.y = this.properties.goalY;
		game.physics.arcade.moveToPointer(this, 50, temp, 300);
	}

	cardObject.updateGoal = function(newCard) {
		this.properties.goalX = newCard.goalX;
		this.properties.goalY = newCard.goalY;
	}

	return cardObject;
}