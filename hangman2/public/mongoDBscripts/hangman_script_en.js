db.hangman_dictionary.drop();



var animals = ("Animals,alligator,ant,bear,bee,bird,camel,cat,cheetah,chicken,chimpanzee,cow,crocodile,deer,dog,dolphin,duck,eagle,"+
	"elephant,fish,fly,fox,frog,giraffe,goat,goldfish,hamster,hippopotamus,horse,kangaroo,kitten,lion,lobster,monkey,octopus,"+
	"owl,panda,pig,puppy,rabbit,rat,scorpion,seal,shark,sheep,snail,snake,spider,squirrel,tiger,turtle,wolf,zebra").split(",");



var body = ("Body,back,cheeks,chest,chin,ears,eyebrows,eyes,feet,fingers,foot,forehead,hair,hands,head,hips,knees,legs,lips,mouth,"+
	"neck,nose,shoulders,stomach,teeth,throat,toes,tongue,tooth,waist").split(",");


var buildings = ("Buildings & Places,airport,apartment building,bank,barber shop,book store,bowling alley,bus stop,church,convenience store,"+
	"department store,fire department,gas station,hospital,house,library,movie theater,museum,office building,post office,"+
	"restaurant,school,mall,supermarket,train station").split(",");


var classroom = ("Classroom,blackboard,blackboard eraser,book,bookcase,bulletin board,calendar,chair,chalk,clock,computer,desk,dictionary,eraser,map,"+
	"notebook,pen,pencil,pencil sharpener,textbook,white board").split(",");


var clothes = ("Clothes,belt,boots,cap,coat,dress,gloves,hat,jacket,jeans,pajamas,pants,raincoat,scarf,shirt,shoes,skirt,slacks,slippers,socks,stockings,suit,"+
	"sweater,sweatshirt,t-shirt,tie,trousers,underclothes,underpants,undershirt").split(",");

var family = ("Family,aunt,brother,cousin,daughter,father,granddaughter,grandmother,grandson,mother,nephew,niece,sister,son,stepdaughter,stepmother,"+
	"stepson,uncle").split(",");

var fruits = ("Fruits,apple,banana,cherry,grapefruit,grapes,lemon,lime,melon,orange,peach,pear,persimmon,pineapple,plum,strawberry,tangerine,"+
	"watermelon").split(",");

var geography = ("Geography,beach,desert,forest,hill,mountain,ocean,pond,river,lake,sea,stream,valley,waterfall,woods").split(",");

var house = ("House,attic,basement,bath tub,bathroom,bed,bedroom,blanket,bookcase,carpet,ceiling,chair,closet,couch,curtain,desk,"+
	"dining room,door,fan,floor,furniture,garage,hall,hallway,key,kitchen,lamp,living room,lock,mirror,picture,porch,roof,"+
	"room,rug,shelf,sink,sofa,stairs,table,toilet,wall,window").split(",");

var vegetables = ("Vegetables,asparagus,beans,broccoli,cabbage,carrot,celery,corn,cucumber,eggplant,green pepper,lettuce,onion,"+
	"peas,potato,pumpkin,radish,spinach,sweet potato,tomato,turnip").split(",");


db.hangman_dictionary.insert(joinCollections([animals, body, buildings, classroom, clothes, family, fruits, geography, house, vegetables]));

function translateToJSON(list) {
	var result = [];
	for(var i = 1; i < list.length; i++) {
		result.push({ 
			"word": list[i], 
			"category": list[0]
		});
	}
	return result;
}


function joinCollections(list) {
	var result = [];
	for(var i = 0; i < list.length; i++) {
		result = result.concat(translateToJSON(list[i]));
	}
	return result;
}