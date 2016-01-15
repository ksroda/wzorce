var auxiliaryRequire = require('./index_auxiliary.js')();
var databaseRequire = require('./index_database.js');


function GameState(func) {
	this.state = func;
}

GameState.prototype.execute = function(io, room) {
	this.state(io, room);
}

module.exports = (function () {

  var instance;
 
  function init() {
 
   var hangman = {
		rooms: []
	}

	hangman.createRoom = function(io, roomName, roomIntervals) {
		var room = new Room(roomName, (new Date).getTime())	;
		room.startLoop(io, roomIntervals);
		this.rooms[room.id] = room;
	}

	//-----------------------------------------------------------------Socket---------------------------------------------------

  hangman.setOnLetterSend = function(socket) {
		var self = this;
		/*socket.on('letterButton', function(letter) {
				console.log(letter + "  " + socket);
*/
				socket.on('letterButton', function(action) {
				console.log(action + "  " + socket);
				
				var currentPlayer = self.rooms[socket.roomId].currentPlayer;
				if(currentPlayer.id == socket.id) {
					currentPlayer.action = action;
				}
			
			/*	var roomIndex = auxiliaryRequire.findRoomByName(games, socket.game, socket.room);
				var currentPlayer = games[socket.game].rooms[roomIndex].currentPlayer;
				if(currentPlayer.id == socket.id) {
					currentPlayer.action = action;
				}*/
			});
	}


	return hangman;
 
  };
 
  return {
 
    // Get the Singleton instance if one exists
    // or create one if it doesn't
    getInstance: function () {
 
      if ( !instance ) {
        instance = init();
      }
 
      return instance;
    }
 
  };
 
})();


//-------------------------------------------------------------------Room---------------------------------------------------

function Room(roomName, currentTime) {
	this.id 					= "hangman." + roomName;
	this.name 					= roomName;
	this.usersNum 				= 0;
	this.playersAll 			= [];
	this.currentPlayerTime 		= 0;
	this.players 				= [];
	this.state 					= "wordRandom";
	this.words 					= [];
	this.guessedLetters 		= [];
	this.guessTime 				= 5000;
	this.roomStartTime 			= (new Date()).getTime();
	this.isRoundStarted 		= false;
	this.wordsList 				= auxiliaryRequire.getWordsList();
	this.timeToThink 			= 15000;
	this.currentPlayerTime 		= (new Date()).getTime();
	this.wordX 					= 600;
	this.wordY 					= 50;
	this.afterGameControlTime 	= (new Date()).getTime();
	this.afterGameTime 			= 3000;
	this.timer 					= 0;
}


Room.prototype.createPlayer = function(player) {
	player.localPoints = 0;
	player.guessedWord = false;
	player.action = "none";
	player.numOfChances = 3;
	player.inGame = true;
	this.playersAll.push(player);
	if(this.playersAll.length === 1) this.currentPlayer = player;
	this.usersNum += 1;
}

Room.prototype.startLoop = function(io, roomIntervals) {
	var intervalId = auxiliaryRequire.randomId();
	this.interval = intervalId;

	var self = this;
	this.changeState(this.wordRandom);
	var interval = setInterval(function() {
		self.gameLoop(io);
	}, 500);
	
	roomIntervals[intervalId] = interval;
}

Room.prototype.setRandomWord = function() {
	//databaseRequire.setRandomWord(this);
}

Room.prototype.changeCurrentPlayer = function(io, player) {
/*	this.currentPlayer = player;
	this.drawingControlTime = (new Date()).getTime();
	this.changeState(this.beginning);*/


}

Room.prototype.userDisconnected = function(io, playerId) {
/*	if(this.currentPlayer.id === playerId) {
		var index = this.playersAll.indexOf(this.currentPlayer);
		index++;
		if(index > this.playersAll.length - 1) {
			index = 0;
		}
		this.changeCurrentPlayer(io, this.playersAll[index]);
	}*/
}

Room.prototype.findPlayerById = function(id) {
	for(var i = 0; i < this.playersAll.length; i++) {
		if(this.playersAll[i].id == id) {
			return this.playersAll[i];
		};
	}
	return undefined; 
};

Room.prototype.getRanking = function() {
	return this.playersAll.sort(function(a,b) {
		return b.localPoints - a.localPoints
	});
};

Room.prototype.randomWordFromList = function() {
	var wordIndex = Math.floor(Math.random() * this.wordsList.length);
	var word = this.wordsList[wordIndex];
	this.wordsList.splice(wordIndex, 1);
	return ({
		id: 	auxiliaryRequire.randomId(),
  		type: 	word.name,
		x: 		1200,
		y: 		100,
/*		goalX: 	room.currentPlayer.x + room.currentPlayer.cardsNumber * 25,
		goalY: 	room.currentPlayer.y,*/
		category: word.category,
		value: 	word.points
	});
}


Room.prototype.changeState = function(loopState) {
	this.loopState = loopState;
}

Room.prototype.wordRandom = new GameState(function(io, room) {
/*	var now = (new Date()).getTime();
	room.state = "beginning";
	room.setRandomWord();
	room.drawingControlTime = (new Date()).getTime();
  	room.changeState(room.drawing);*/
  	room.state ="wordRandom";

	timer = 0;
	var word = room.randomWordFromList();
	console.log("slowo: "+word.type);
	room.words.push(word.type);
	var remainingLength = word.type.length;

/*	room.players = [];
	for(var i=0; i < room.playersAll.length; i++){
		room.players.push(room.playersAll[i]);
	}*/

	//room.playersAll[0].inGame = true;
	room.currentPlayer = room.playersAll[0];
	room.changeState(room.guessing);


});

Room.prototype.guessing = new GameState(function(io, room) {
/*	var now = (new Date()).getTime();
	room.state = "drawing time";
	room.playersAll.forEach(function(player) {
	if(player.guessedWord) {
		room.currentPlayer = player;
			player.localPoints += room.pointsForWin;
			player.overallPoints += room.pointsForWin;
			io.to(room.id).emit("player who won", {
			player: player,
			currentWord: room.currentWord
		});
		room.afterGameControlTime = now;
		room.changeState(room.afterGame);
	}
	});
	room.timer = Math.ceil((room.drawingTime - (now - room.drawingControlTime))/1000);
	if(now - room.drawingControlTime > room.drawingTime) {
		room.changeCurrentPlayer(io, room.playersAll[Math.floor(Math.random() * room.playersAll.length)]);
	}*/

	room.state = "guessing";
	if (room.currentPlayer.action != "none") { //gracz current wcisnal literke
		var letter = room.currentPlayer.action;

						//zablokuj przycisk
		io.to(room.id).emit('blockLetter', {
			litera: letter
		});


		console.log(letter + " dl " + letter.length);
		var position= []; 
		var word = room.words[room.words.length-1]; 
		room.currentPlayer.action = "none";

		for(var i = 0; i < word.length; i++){
			if(word[i]=== letter){
				position.push(i);
				console.log("w slowie jest "+letter);
			}
		}
		if(position.length>0){//current zgadl litere
			room.guessedLetters.push(letter);
			//odslon litere


			room.changeState(room.letterGuessed);

		}
		else{//nie zgadl litery TODO!!!!!!!!!!!!!!!!!!!!!!1

			//rysujwisielca

			room.currentPlayer.numOfChances--;
			console.log("szans="+room.currentPlayer.numOfChances);


			var index = room.playersAll.indexOf(room.currentPlayer);

			if (room.currentPlayer.numOfChances==0){
				room.playersAll[index].inGame = false;
				//room.players.splice(room.players.indexOf(room.currentPlayer),1);
			}

			//zmiana gracza
	
			var licznik = 0;

			while(licznik<=room.playersAll.length){
				index++;
				licznik++;

				if(index > room.playersAll.length - 1) {
					index = 0;
				}

				if (room.playersAll[index].inGame == true) {
					room.currentPlayer = room.playersAll[index];
					licznik = 1000; //zeby wyjsc z while'a
				}
			}

			if (licznik == 1000) { //mamy nastepnego gracza
				room.currentPlayer = room.playersAll[index];
				room.changeState(room.guessing);
			}
			else { //nie mamy graczy z zachowanymi szansami
				room.changeState(room.reset);
			}
			
		}
	}
});

Room.prototype.letterGuessed = new GameState(function(io, room) {
/*	var now = (new Date()).getTime();
	room.state = "after game";
	//if(now - room.afterGameControlTime > room.afterGameTime) {
			//	room.afterGameControlTime = now;
				room.playersAll.forEach(function(player) {
					player.guessedWord = false;
				})
				room.changeState(room.beginning);
			//}*/

	room.state="letterGuessed";
	room.currentPlayer.pointsHangman += 50;
		console.log("current player: " + room.currentPlayer.name + " jego pkty= " + room.currentPlayer.pointsHangman);
		if(room.guessedLetters.length==room.words[room.words.length-1].length){ //wszystkie litery odgadniete
			room.currentPlayer.pointsHangman += 200; //pkty dla zwyciezcy
			console.log("koniec; current player: " + room.currentPlayer.name + " jego pkty= " + room.currentPlayer.pointsHangman);
			//room.state="reset";
			room.changeState(room.reset);
		}
		else{
			//zmiana gracza
			
			var index = room.playersAll.indexOf(room.currentPlayer);
			var licznik = 0;

			while(licznik<=room.playersAll.length){
				index++;
				licznik++;

				if(index > room.playersAll.length - 1) {
					index = 0;
				}

				if (room.playersAll[index].inGame = true) {
					room.currentPlayer = room.playersAll[index];
					licznik = 1000; //zeby wyjsc z while'a
				}
				
			}

			if (licznik == 1000) { //mamy nastepnego gracza
				room.currentPlayer = room.playersAll[index];
				room.changeState(room.guessing);
			}
			else { //nie mamy graczy z zachowanymi
				room.changeState(room.reset);
			}
		}

		
});

Room.prototype.reset = new GameState(function(io, room) {
/*	var now = (new Date()).getTime();
	room.state = "after game";
	//if(now - room.afterGameControlTime > room.afterGameTime) {
			//	room.afterGameControlTime = now;
				room.playersAll.forEach(function(player) {
					player.guessedWord = false;
				})
				room.changeState(room.beginning);
			//}*/

	room.state="reset";
	//room.changeState(room.reset);
	room.guessedLetters = [];
	//room.state = "wordRandom";
	//room.currentPlayer = 0;
	io.to(room.id).emit('unblockLetters');

	for(var i=0; i < room.playersAll.length; i++){
		room.playersAll[i].numOfChances = 3;
	}

	if (room.wordsList.length == 0) {
		room.wordsList = auxiliaryRequire.getWordsList();
	}

	for(var i = 0; i < room.playersAll.length; i++) {
		room.playersAll[i].action = "none";
	}

	room.changeState(room.wordRandom);


});

Room.prototype.gameLoop = function(io) {
	this.loopState.execute(io, this);

	io.to(this.id).emit('update', {
		currentWord: this.currentWord,
		currentPlayer: this.currentPlayer,
		timer: this.timer,
		ranking: this.getRanking()
	});

	console.log("Game state: " + this.state  +
		"   Current player: " + this.currentPlayer.name + " numb of players: "+this.playersAll.length);
}