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
		rooms: {}
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
	this.wordsList 				= [];
	this.timeToThink 			= 15000;
	this.currentPlayerTime 		= (new Date()).getTime();
	this.wordX 					= 600;
	this.wordY 					= 50;
	this.afterGameControlTime 	= (new Date()).getTime();
	this.afterGameTime 			= 3000;
	this.timer 					= 0;
	this.numOfChances			= 11;
	this.wrongLetters 			= [];
}


Room.prototype.createPlayer = function(player) {
	player.localPoints = 0;
	player.guessedWord = false;
	player.action = "none";
	player.numOfChances = this.numOfChances;
	player.inGame = true;
	player.localPoints = 0;

	this.playersAll.push(player);
	if(this.playersAll.length === 1) this.currentPlayer = player;
	this.usersNum += 1;
}

Room.prototype.startLoop = function(io, roomIntervals) {
	var intervalId = auxiliaryRequire.randomId();
	this.interval = intervalId;

	this.changeState(this.wordRandom);
	var self = this;
	// this.changeState(this.beginning);
	databaseRequire.getWordForHangman(this, function() {
		var interval = setInterval(function() {
			self.gameLoop(io);
		}, 250);
		
		roomIntervals[intervalId] = interval;
	});
}

Room.prototype.changeCurrentPlayer = function(io, player) {
	var index = this.players.indexOf(this.currentPlayer);
	index++;
	if(index > this.players.length - 1) {
		index = 0;
	}
	this.currentPlayer = this.players[index];
	//this.currentPlayerTime = (new Date()).getTime();
}

Room.prototype.userDisconnected = function(io, playerId) {
	if (this.players.length == 1){
		this.changeState(this.reset);
	}

	if(this.currentPlayer.id === playerId) {
	 	var index = this.players.indexOf(this.currentPlayer);
		index++;
		if(index > this.players.length - 1) {
			index = 0;
		}
		this.currentPlayer = this.players[index];

		for(var i = 0; i < this.players.length; i++) {
			if(this.players[i].id === playerId) {
				this.players.splice(i, 1);
				break;
			}
		}
		// this.players.splice(this.players.indexOf(this.currentPlayer), 1);
		//this.changeCurrentPlayer(io, this.playersAll[index]);
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

Room.prototype.getRanking = function() {
	for(var i = 0; i < this.playersAll.length; i++) {
		if(this.players.indexOf(this.playersAll[i]) === -1) {
			this.playersAll[i].localPoints = -1;
		}
	}

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
  		type: 	word.word.replace(/[^a-zA-Z\s]/g, "").toLowerCase(),
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
};


Room.prototype.wordRandom = new GameState(function(io, room) {
/*	var now = (new Date()).getTime();
	room.state = "beginning";
	room.setRandomWord();
	room.drawingControlTime = (new Date()).getTime();
  	room.changeState(room.drawing);*/
  	room.state ="wordRandom";


  	room.numOfChances = Math.ceil(11/room.playersAll.length);

	timer = 0;
	var word = room.randomWordFromList();

	room.encryptedWord = word.type.replace(/[a-zA-Z]/g, "_")
	// io.to(room.id).emit("new word", room.encryptedWord);

	console.log("slowo: "+word.type);
	room.words.push(word.type);
	var remainingLength = word.type.length;

	room.players = [];
	for(var i=0; i < room.playersAll.length; i++){
		room.playersAll[i].numOfChances = room.numOfChances;
		room.playersAll[i].inGame = true;
		room.playersAll[i].localPoints = 0;
		room.players.push(room.playersAll[i]);

	}

	//room.playersAll[0].inGame = true;
	room.currentPlayer = room.players[0];
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
		


		console.log(letter + " dl " + letter.length);
		var position= []; 
		var word = room.words[room.words.length-1]; 
		room.currentPlayer.action = "none";

		for(var i = 0; i < word.length; i++){
			if(word[i]=== letter){
				position.push(i);
				console.log("w slowie jest "+letter +" na pozycji " + position);
			}
		}

		if(position.length === 0) {
			io.to(room.id).emit('wrongLetter', {
				litera: letter,
				positions: []
			});

			room.wrongLetters.push(letter);

			room.currentPlayer.numOfChances--;
			console.log("szans="+room.currentPlayer.numOfChances);


			var index = room.players.indexOf(room.currentPlayer);

			if (room.currentPlayer.numOfChances==0){
				room.players[index].inGame = false;
				//room.players.splice(room.players.indexOf(room.currentPlayer),1);
			}

			//zmiana gracza
	
			var licznik = 0;

			while(licznik<=room.players.length){
				index++;
				licznik++;

				if(index > room.players.length - 1) {
					index = 0;
				}

				if (room.players[index].inGame == true) {
					room.currentPlayer = room.players[index];
					licznik = 1000; //zeby wyjsc z while'a
				}
			}

			if (licznik == 1000) { //mamy nastepnego gracza
				room.currentPlayer = room.players[index];
				room.changeState(room.guessing);
			}
			else { //nie mamy graczy z zachowanymi szansami
				room.changeState(room.reset);
			}
		} else {
			io.to(room.id).emit('correctLetter', {
				litera: letter,
				positions: position
			});

			room.guessedLetters.push({
				letter: letter,
				positions: position
			});
			//odslon litere


			room.changeState(room.letterGuessed);
		}
	}
});

Room.prototype.numberOfGuessedLetters = function() {
	var result = 0;
	for(var i = 0; i < this.guessedLetters.length; i++) {
		result += this.guessedLetters[i].positions.length;
	}
	return result;
}

Room.prototype.letterGuessed = new GameState(function(io, room) {
/*	var now = (new Date()).getTime();
	room.state = "after game";
	//if(now - room.afterGameControlTime > room.afterGameTime) {
			//	room.afterGameControlTime = now;
				room.players.forEach(function(player) {
					player.guessedWord = false;
				})
				room.changeState(room.beginning);
			//}*/

	room.state="letterGuessed";
	room.currentPlayer.localPoints += 50;
		console.log("current player: " + room.currentPlayer.name + " jego pkty= " + room.currentPlayer.localPoints);
		if(room.numberOfGuessedLetters()==room.words[room.words.length-1].replace(/\s/g,"").length){ //wszystkie litery odgadniete
			room.currentPlayer.localPoints += 200; //pkty dla zwyciezcy
			console.log("koniec; current player: " + room.currentPlayer.name + " jego pkty= " + room.currentPlayer.localPoints);
			//room.state="reset";
			room.changeState(room.reset);
		}
		else{
			//zmiana gracza
			
			var index = room.players.indexOf(room.currentPlayer);
			var licznik = 0;

			while(licznik<=room.players.length){
				index++;
				licznik++;

				if(index > room.players.length - 1) {
					index = 0;
				}

				if (room.players[index].inGame = true) {
					room.currentPlayer = room.players[index];
					licznik = 1000; //zeby wyjsc z while'a
				}
				
			}

			if (licznik == 1000) { //mamy nastepnego gracza
				room.currentPlayer = room.players[index];
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
				room.players.forEach(function(player) {
					player.guessedWord = false;
				})
				room.changeState(room.beginning);
			//}*/

	room.state="reset";
	//room.changeState(room.reset);
	room.guessedLetters = [];
	room.encryptedWord = "";

	room.wrongLetters = [];
	//room.state = "wordRandom";
	//room.currentPlayer = 0;
	io.to(room.id).emit('unblockLetters');

	for(var i=0; i < room.players.length; i++){
		room.players[i].numOfChances = 11;
	}

	if (room.wordsList.length == 0) {
		room.wordsList = auxiliaryRequire.getWordsList();
	}

	for(var i = 0; i < room.players.length; i++) {
		room.players[i].action = "none";
	}

	room.changeState(room.wordRandom);


});


Room.prototype.gameLoop = function(io) {
	this.loopState.execute(io, this);

	io.to(this.id).emit('update', {
		wrongLetters: this.wrongLetters,
		guessedLetters: this.guessedLetters,
		encryptedWord: this.encryptedWord,
		currentPlayer: this.currentPlayer,
		timer: this.timer,
		state: this.state,
		ranking: this.getRanking()
	});

	console.log("Game state: " + this.state  +
		"   Current player: " + this.currentPlayer.name + " numb of players: "+this.players.length);
}