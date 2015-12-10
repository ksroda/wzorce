module.exports = function() {
	var abc = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','r','s','t','u','w','x','y','z'];


	var randomLetter = function() {
		return abc[Math.floor(Math.random() * abc.length)];
	}

	var randomNumber = function() {
		return Math.floor(Math.random() * 10);
	}


	var publicRandomId = function() {
		return randomLetter() + randomNumber() + randomLetter() + randomNumber() + 
				randomLetter() + randomNumber() + randomLetter() + randomNumber() + 
				randomLetter() + randomNumber() + randomLetter() + randomNumber() + 
				randomLetter() + randomNumber() + randomLetter() + randomNumber();
	}


	var publicGetCardsStack = function() {
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

	var spr = function(slowo,wzorzec){
		var tab1 =[];
		var tab2 = [];
		var licznik = 0;

	    for(var i=0;i<wzorzec.length-1;i++){
	        tab1.push(wzorzec.charAt(i)+wzorzec.charAt(i+1));
	    }
	    for(var i=0;i<slowo.length-1;i++){
	        tab2.push(slowo.charAt(i)+slowo.charAt(i+1));
	    }

	    for(var i=0;i<slowo.length;i++){
	        for(var j=0;j<wzorzec.length;j++){
	            if(tab1[j] == tab2[i]) licznik++;
	        }
	    }

		return licznik;
	}

	var publicCorrectness = function(input, pattern) {
		if (typeof input == "string" || input instanceof String) {
	        if(input.toLowerCase().trim() === pattern.toLowerCase().trim()) {
	        	return 2; //trim usuwa spacje sprzed i po
	        }
			var etap1 = input.replace(/\s/g,"").toLowerCase();
			var etap2 = pattern.replace(/\s/g,"").toLowerCase();

			if(etap1.length<=etap2.length*0.6 || etap1.length>=etap2.length*1.4) {
				return 0;
			} else {
	            var etap1 = input.toLowerCase();
	            var etap2 = pattern.toLowerCase();
	            suma = spr(etap1,etap2);
	            if (suma/etap2.length >=0.6) {
	            	return 1
	            };
	            return 0;
	        }
		}
		else {
			return 0
		};

	}


	return {
		randomId: publicRandomId,
		getCardsStack: publicGetCardsStack,
		correctness: publicCorrectness
	}

}