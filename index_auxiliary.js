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

			var stackLength = stack.length;
			for(var i = 0; i < stack.length; i++) {
				var card = stack.splice(Math.floor(Math.random() * stackLength), 1);
				stack = stack.concat(card);
				stackLength--;
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

	var publicObjectToArray = function(object) {
		var result = [];
		for(var x in object) {
			result.push(object[x]);
		}
		return result;
	}

	var isLetter = function(str) {
	  return str.length === 1 && str.match(/[a-z|A-Z]/i);
	}


	var publicGenerateChatName = function(string1, string2) {

		if (string1 == string2) return string1+"!"+string2;

		else if (string1.length<=string2.length) { //1 krotsza

			for (var i = 0; i< string1.length; i++){

				if (isNaN(parseInt(string1.charAt(i))) && !isLetter(string1.charAt(i))){ //1 to znak
					console.log("jestem 1");
					if (!isNaN(parseInt(string2.charAt(i))) || isLetter(string2.charAt(i))){ //2 to nie znak
						return string2+"!"+string1;
					}
					else{//2 to tez znak
						//to nic
					}
				}
				else{//1 to nie znak 
					if (!isNaN(parseInt(string2.charAt(i))) || isLetter(string2.charAt(i))){ //2 to nie znak
						//to nic
					}
					else{//2 to znak 
						return string1+"!"+string2;

					}
				} 

				if (string1.charCodeAt(i)>=48 && string1.charCodeAt(i)<=57) { //cyfra
					if (string2.charCodeAt(i)>=48 && string2.charCodeAt(i)<=57) { // tez cyfra
						//to nic 
					}
					else{ //2 to nie cyfra 
						return string2+"!"+string1;
					}
				}
				else {//1 to nie cyfra
					if (string2.charCodeAt(i)>=48 && string2.charCodeAt(i)<=57) { // 2 to cyfra
						return string1+"!"+string2;
											}
											else{ //2 to nie cyfra 
												//to nic 
											}
				}

				if (string1.charCodeAt(i) < string2.charCodeAt(i)){
					//pierwszy = string1;
					return string1+"!"+string2;
				}
				else if (string1.charCodeAt(i) > string2.charCodeAt(i)) {
					return string2+"!"+string1;
				}
			}

			return string1+"!"+string2;
		}

		else{

			for (var i = 0; i < string2.length; i++){
	 
				if (isNaN(parseInt(string2.charAt(i))) && !isLetter(string2.charAt(i))){ //2 to znak
					//console.log("jestem tu 2");
					if (!isNaN(parseInt(string1.charAt(i))) || isLetter(string1.charAt(i))){ //1 to nie znak
						return string1+"!"+string2;
					}
					else{//1 to tez znak
						//to nic
					}
				}
				else{//2 to nie znak 
					if (!isNaN(parseInt(string1.charAt(i))) || isLetter(string1.charAt(i))){ //1 to nie znak
						//to nic
					}
					else{//1 to znak 
						return string2+"!"+string1;

					}
				}

				if (string2.charCodeAt(i)>=48 && string2.charCodeAt(i)<=57) { //cyfra
					if (string1.charCodeAt(i)>=48 && string1.charCodeAt(i)<=57) { // tez cyfra
						//to nic 
					}
					else{ //2 to nie cyfra 
						return string1+"!"+string2;
					}
				}
				else {//1 to nie cyfra
					if (string1.charCodeAt(i)>=48 && string1.charCodeAt(i)<=57) { // 2 to cyfra
						return string2+"!"+string1;
											}
											else{ //2 to nie cyfra 
												//to nic 
											}
				}

				if (string2.charCodeAt(i) < string1.charCodeAt(i)){
					return string2+"!"+string1;
				}
				else if (string2.charCodeAt(i) > string1.charCodeAt(i)) {
					return string1+"!"+string2;
				}
			}

			return string2+"!"+string1;
		}		
	}


	return {
		randomId: publicRandomId,
		getCardsStack: publicGetCardsStack,
		correctness: publicCorrectness,
		objectToArray: publicObjectToArray,
		generateChatName: publicGenerateChatName
	}
}