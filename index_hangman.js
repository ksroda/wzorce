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
				socket.on('letterButton', function(letterChosen) {
				// console.log(action + "  " + socket);
				
				var currentPlayer = self.rooms[socket.roomId].currentPlayer;
				if(currentPlayer.id === socket.id) {
					currentPlayer.letterChosen = letterChosen;
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
	this.currentWord 			= "";
	this.guessedLetters 		= [];
	this.wordsList 				= [];
	this.timeToThink 			= 10000;
	this.afterGameControlTime 	= (new Date()).getTime();
	this.afterGameTime 			= 3000;
	this.numOfChances			= 11;
	this.wrongLetters 			= [];
}


Room.prototype.createPlayer = function(player) {
	player.localPoints = 0;
	player.guessedWord = false;
	player.letterChosen = "none";
	player.inGame = true;
	player.waiting = true;
	player.startTime = 0; 

	this.playersAll.push(player);
	if(this.playersAll.length === 1) this.currentPlayer = player;
	this.usersNum += 1;
}

Room.prototype.startLoop = function(io, roomIntervals) {
	var intervalId = auxiliaryRequire.randomId();
	this.interval = intervalId;

	this.changeState(this.wordRandom);
	var self = this;

	databaseRequire.getWordForHangman(this, function() {
		var interval = setInterval(function() {
			self.gameLoop(io);
		}, 250);
		roomIntervals[intervalId] = interval;
	});
}

Room.prototype.changeCurrentPlayer = function() {
	var index = this.players.indexOf(this.currentPlayer);
	index++;
	if(index > this.players.length - 1) {
		index = 0;
	}
	this.currentPlayer = this.players[index];
	this.currentPlayer.startTime = (new Date).getTime();
	this.currentPlayerTime = 10;
}

Room.prototype.userDisconnected = function(io, playerId) {
	if (this.players.length == 1){
		this.changeState(this.reset);
	} else {
		if(this.currentPlayer.id === playerId) {
		 	var index = this.players.indexOf(this.currentPlayer);
			index++;
			if(index > this.players.length - 1) {
				index = 0;
			}
			this.currentPlayer = this.players[index];
		}

		for(var i = 0; i < this.players.length; i++) {
			if(this.players[i].id === playerId) {
				this.players.splice(i, 1);
				break;
			}
		}
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
			this.playersAll[i].waiting = true;
		}
	}

	return this.playersAll.sort(function(a,b) {
		return b.localPoints - a.localPoints
	});
};

Room.prototype.randomWordFromList = function() {
	var wordIndex = Math.floor(Math.random() * this.wordsList.length);
	var word = this.wordsList[wordIndex];
	// this.wordsList.splice(wordIndex, 1);
	return ({
  		value: word.word.replace(/[^a-zA-Z\s]/g, "").toLowerCase(),
		category: word.category
	});
}

Room.prototype.changeState = function(loopState) {
	this.loopState = loopState;
};


Room.prototype.wordRandom = new GameState(function(io, room) {
  	room.state ="wordRandom";
  	room.numOfChances = 11;

	var word = room.randomWordFromList();
	room.encryptedWord = word.value.replace(/[a-zA-Z]/g, "_");

	// console.log("current word: " + word.value);
	room.currentWord = word.value;
	room.wordCategory = word.category;

	room.players = [];
	for(var i = 0; i < room.playersAll.length; i++){
		room.playersAll[i].inGame = true;
		room.playersAll[i].waiting = false;
		room.players.push(room.playersAll[i]);
	}

	room.currentPlayer = room.players[0];
	room.currentPlayer.startTime = (new Date).getTime();
	room.changeState(room.guessing);
});

Room.prototype.guessing = new GameState(function(io, room) {
	room.state = "guessing";
	var now = (new Date).getTime();

	room.currentPlayerTime = room.timeToThink/1000 - Math.floor((now - room.currentPlayer.startTime)/1000);
	if(room.currentPlayerTime <= 0) {
		room.changeCurrentPlayer();
		room.numOfChances--;

		io.to(room.id).emit('wrongLetter', {
			letter: "none",
			positions: []
		});
		
		if (room.numOfChances === 0) {
			room.changeState(room.reset);
		}
	} else 
		if (room.currentPlayer.letterChosen != "none") {
		var letter = room.currentPlayer.letterChosen;
		room.currentPlayer.letterChosen = "none";

		var letterPositionsInTheWord = []; 
		var word = room.currentWord; 

		for(var i = 0; i < word.length; i++){
			if(word[i] === letter){
				letterPositionsInTheWord.push(i);
			}
		}

		// console.log("word: " + word + "   letter: " + letter);

		if(letterPositionsInTheWord.length === 0) {
			room.numOfChances--;

			io.to(room.id).emit('wrongLetter', {
				letter: letter,
				positions: []
			});

			room.wrongLetters.push(letter);
			if (room.numOfChances === 0) {
				room.changeState(room.reset);
			}

		} else {
			io.to(room.id).emit('correctLetter', {
				letter: letter,
				positions: letterPositionsInTheWord
			});

			room.guessedLetters.push({
				letter: letter,
				positions: letterPositionsInTheWord
			});
			room.givePoints();
		}
		room.changeCurrentPlayer();
	}
});

Room.prototype.givePoints = function() {
	this.currentPlayer.localPoints += 50;
	this.currentPlayer.overallPoints += 50;
	if(this.numberOfGuessedLetters() === this.currentWord.replace(/\s/g,"").length) { //wszystkie litery odgadniete
		for(var i = 0; i < this.players.length; i++) {
			this.players[i].localPoints += 100;
			this.currentPlayer.overallPoints += 100;
		}
		this.changeState(this.reset);
	}
}

Room.prototype.numberOfGuessedLetters = function() {
	var result = 0;
	for(var i = 0; i < this.guessedLetters.length; i++) {
		result += this.guessedLetters[i].positions.length;
	}
	return result;
}

Room.prototype.reset = new GameState(function(io, room) {
	room.state="reset";
	room.guessedLetters = [];
	room.encryptedWord = "";
	room.wrongLetters = [];
	room.numOfChances = 11;

	io.to(room.id).emit('unblockLetters');

	for(var i = 0; i < room.players.length; i++) {
		room.players[i].action = "none";
	}

	room.changeState(room.wordRandom);
});


Room.prototype.gameLoop = function(io) {
	this.loopState.execute(io, this);

	io.to(this.id).emit('update', {
		wordCategory: this.wordCategory,
		wrongLetters: this.wrongLetters,
		guessedLetters: this.guessedLetters,
		encryptedWord: this.encryptedWord,
		currentPlayer: this.currentPlayer,
		timer: this.currentPlayerTime,
		state: this.state,
		ranking: this.getRanking()
	});

	// console.log("Game state: " + this.state  +
	// 	"   Current player: " + this.currentPlayer.name + " numb of players: "+this.players.length);
}