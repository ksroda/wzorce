var abc = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','r','s','t','u','w','x','y','z'];

module.exports.randomId = function randomId() {
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

module.exports.findRoomByName = function findRoomByName(games, gameName, roomName) {
	for(var i = 0; i < games[gameName].rooms.length; i++) {
		if(games[gameName].rooms[i].name === roomName) return i;
	}
	return -1;
}


module.exports.getCardsStack = function() {
	var cards = [];

		var suits = ["hearts", "spades", "clubs", "diamonds"];
		var symbols = [
			{ type:2, 	value: 2  },
			{ type:3, 	value: 3  },
			{ type:4, 	value: 4  },
			{ type:5, 	value: 5  },
			{ type:6, 	value: 6  },
			{ type:7, 	value: 7  },
			{ type:8, 	value: 8  },
			{ type:9, 	value: 9  },
			{ type:10,  value: 10 },
			{ type:"jack", value: 10 },
			{ type:"queen", value: 10 },
			{ type:"king", value: 10 },
			{ type:"ace", value: 11 }
		];

		for(var i in suits) {
			for(var j in symbols) {
				cards.push({ type: symbols[j].type + "_of_" + suits[i], value: symbols[j].value });
			}
		}
		
		var stack = cards.concat(cards).concat(cards).concat(cards);

		for(var i = 0; i < 1000; i++) {
			var card = stack.splice(Math.floor(Math.random() * stack.length), 1);
			stack = stack.concat(card);
		}

		return stack;	
}