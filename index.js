var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var sio = require('socket.io');
var port = process.env.PORT || 5000;

var db;
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://db_user:db_user123@ds033734.mongolab.com:33734/wzorce';


MongoClient.connect(url, function(err, database) {
		assert.equal(null, err);
		db = database;
		//server.listen(port);
		//console.log("Listening on " + port);
	});
	
server.listen(port);
console.log("Listening on " + port);
var io = sio.listen(server);

app.use(express.static(__dirname + '/public'));
app.set('view engine','ejs');

app.get('/charades', function(req, res) {
	res.render('charades');
});

app.get('/charades/rooms', function(req, res) {
  res.send(games["charades"].rooms);
});

app.get('/blackjack', function(req, res) {
	res.render('blackjack');
});

app.get('/blackjack/rooms', function(req, res) {
  res.send(games["blackjack"].rooms);
});

var roomsIntervals = {};

var games = {};

games["blackjack"] = {
		rooms: []
	}
	
games["charades"] = {
		rooms: []
	}

games["blackjack"].createRoom = function(roomName) {
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
	
	this.rooms.push(room);
	
	var intervalId = Math.random() * 10000000;
	
	this.rooms[findRoomByName("blackjack", roomName)].interval = intervalId;
		
	var interval = setInterval(function() {
			gameLoop(games["blackjack"].rooms[findRoomByName("blackjack", roomName)]);
	}, 33);
	
	roomsIntervals[intervalId] = interval;
}

games["blackjack"].createPlayer = function(user, roomName) {
	var roomIndex = findRoomByName("blackjack",roomName);
	this.rooms[roomIndex].playersAll.push(user);
}

games["charades"].createRoom = function(name) {
	this.rooms.push({
			id: "charades." + name,
			name: name,
			usersNum: 0
		})
}

io.on('connection', function(socket) {
		game.setOnWelcome(socket);
		game.setOnDisconnect(socket);
		game.setOnMessage(socket);
		game.charades.setOnMouseDown(socket);
		game.charades.setOnMouseDrag(socket);
});

//--------------------------------------------------------------

var game = {
	setOnWelcome: function(socket) {
		socket.on('welcome', function(user) {
			socket.name = user.name;
			socket.room = user.room;
			socket.game = user.game;
			socket.join(socket.game + "." + socket.room);
			

			var i = findRoomByName(socket.game, socket.room);
			if(i === -1) {
				games[socket.game].createRoom(socket.room);
			}
			
			games[socket.game].rooms[findRoomByName(socket.game, socket.room)].usersNum += 1;


			var player = {
				id: socket.id,
				name: socket.name,
				room: socket.room,
				overallPoints: 1000
			}
			
			switch(socket.game){
				case "blackjack":
					player.cardsNumber = 0;
					player.action = "none";
					player.cardsSum = 0;
					player.pointsBet = 100;
					player.x = 1000 - 200 * games[socket.game].rooms[findRoomByName(socket.game, socket.room)].playersAll.length;
					player.y = 600;
					break;			
			}


			games[socket.game].createPlayer(player, socket.room);
			io.emit('update rooms', games[socket.game].rooms);
		});
	},
	
	setOnDisconnect: function(socket) {
		socket.on('disconnect', function() {
			if(socket.game) {
				var roomIndex = findRoomByName(socket.game, socket.room);
				if(-1 != roomIndex) { 
					games[socket.game].rooms[roomIndex].usersNum -= 1;
					
					for(var i = 0; i < games[socket.game].rooms[roomIndex].playersAll.length; i++) {
						if(games[socket.game].rooms[roomIndex].playersAll[i].id === socket.id) {
							games[socket.game].rooms[roomIndex].playersAll.splice(i, 1);
							break;
						}
					}
			
					if(games[socket.game].rooms[roomIndex].usersNum <= 0) {
						clearInterval(roomsIntervals[games[socket.game].rooms[roomIndex].interval]);
						games[socket.game].rooms.splice(roomIndex, 1);
					}
			
					io.emit('update rooms', games[socket.game].rooms);
				}
			}
		});
	},
	
	setOnMessage: function(socket) {
		socket.on('message', function(msg) {
				io.to(socket.game + "." + socket.room).emit('message', msg);
		});
	},
	//-----------------Charades-------------------------------------
	charades: {
		setOnMouseDown: function(socket) {
			socket.on('mouse down', function(msg) {
					socket.broadcast.to(socket.game + "." + socket.room).emit('mouse down', msg);
			});
		},
		
		setOnMouseDrag: function(socket) {
			socket.on('mouse drag', function(msg) {
					socket.broadcast.to(socket.game + "." + socket.room).emit('mouse drag', msg);
			});
		}
	}
}

function findRoomByName(gameName, roomName) {
	for(var i = 0; i < games[gameName].rooms.length; i++) {
		if(games[gameName].rooms[i].name === roomName) return i;
	}
	return -1;
}


function gameLoop(room) {
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


function Card(id, x, y, goalX, goalY, type, value){
  this.id = id;
	this.x = x;
	this.y = y;
	this.goalX = goalX;
	this.goalY = goalY;
	this.value = value;

}

function getCardsStack() {
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


var abc = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','r','s','t','u','w','x','y','z'];

function randomId() {
	return randomLetter() + randomNumber() + randomLetter() + randomNumber() + 
			randomLetter() + randomNumber() + randomLetter() + randomNumber() + 
			randomLetter() + randomNumber() + randomLetter() + randomNumber() + 
			randomLetter() + randomNumber() + randomLetter() + randomNumber();
}

function randomLetter() {
	return abc[Math.floor(Math.random() * abc.length)];
}

function randomNumber() {
	return Math.floor(Math.random() * 10);
}
