db.charades_dictionary.drop();


var easy = ("Thing;Stop;Alligator;Dance;Skip;Football;Kick;Head;Sunglasses;Pinch;Chair;Jump;"+
	"Scissors;Point;Star;Tree;Airplane;Tail;Basketball;Mouth;Telephone;Chin;Jar;Smile;Cheek;Ear;Drum;Room;"+
	"Turtle;Wings;Doll;Bird;Hopscotch;Happy;Baby;Pig;Crayon;Arm;Book;Camera;"+
	"Rock;Robot;Drink;Balloon;Kangaroo;Clap;Baseball;"+
	"Milk;Icecream;Circle").split(";");


var moderate = ("Thing;Wink;Ball;Rope;Elbow;Beg;Rollerblade;Summer;Cow;Fang;Table tennis;Snowball;Guitar;Alarm;"+
	"Cape;Bird;Saddle;Rain;Bike;Roof;Blind;Hoop;Violin;Coil;Goldfish;Frankenstein;Stairs;Dog;String;"+
	"Cage;Mailbox;Puppet;Shovel;Popcorn;Butter;Trumpet;Haircut;Shopping trolley;Lipstick;"+
	"Soap;Hula;Mop;Money;Food;Glue;Banana;Hot;See-saw;Jellyfish").split(";");


var hard = ("Thing;Gingerbread;Lawn mower;Windmill;Bobsled;Sand;Year;Stain;Vest;Swordfish;Pizza;Party;Wrench;"+
	"Knot;Hair;Spine;Beetle;Trip;Gym;Sip;Torch;"+
	"Cowboy;Carrot;Spider web;Lung;Basket;Flamingo;Dryer;Blinds;Brain;Business;Eraser;Volcano;"+
	"Funny;Quicksand;Trap;Sheet;Mouse;Poison;Nightmare;Vegetable;Anger;Badge;Bubble;"+
	"Doghouse;Mirror;Doctor;Wig").split(";");

var very_hard = ("Thing;Calendar;Killer;Channel;Pinboard;Shipwreck;Chuck norris;Mine;Hydrant;Alphabet;Journal;"+
	"Level;Portfolio;Evolution;Train;Lettuce;Crumbs;Daughter;Jetlag;Flag;Teenager;Invitation;Pendulum;Carpenter;Olive oil;"+
	"Music;Conversation;Application;Tomato sauce;Police;Island;Unemployed;Faucet;Computer monitor;Lifestyle;Apathy").split(";");

var animals = ("Animal;Mosquito;Rabbit;Penguin;Oyster;Mule;Gorilla;Moose;Yak;Squid;Chicken;Crane;"+
	"Shark;Donkey;Dolphin;Monkey;Gazelle;Fly;Giraffe;Elephant;Spider;Eagle;Rat;Raven;Oryx;Wasp;Koala;"+
	"Pony;Ant;Bat;Human;Chimpanzee;Horse;Mole;Worm;Beaver;Guineapig;Ostrich;Gull;"+
	"Skunk;Sheep;Llama;Snake;Crocodile;Badger;Leopard;Pigeon;Bee;Cockroach;Salamander;Deer;Goat;"+
	"Kangaroo;Bear;Gnu;Falcon;Elk;Weasel;Ape").split(";");


var idiom = ("Idiom;Bite your tongue;A slap on the wrist;You can't judge a book by its cover;Off on the wrong foot;"+
	"Grab the bull by the horns;Never bite the hand that feeds you;"+
	"Out of this world;All bark and no bite;Water under the bridge;"+
	"Make a mountain out of a molehill;Pull the wool over your eyes;Finger lickin' good;"+
	"Between a rock and a hard place;Curiosity killed the cat;"+
	"A drop in the bucket;Start from scratch;A piece of cake;Up a creek without a paddle;Green with envy;"+
	"Don't put all your eggs in one basket;Tie the knot;Cost an arm and a leg;Take a hike;"+
	"Wear your heart on your sleeve;Kick the bucket;A wolf in sheep's clothing;"+
	"Two left feet;In the bag;Over my dead body").split(";");

var characters = ("Character;Stephen Hawking;Yoda;Thomas Edison;Leonardo DiCaprio;Socrates;Neil Armstrong;"+
	"Indiana Jones;Spider Man;Sherlock Holmes;Albert Einstein;Winnie the Pooh;Shakespeare;Snoopy;"+
	"Kermit the Frog;Christopher Columbus;Abraham Lincoln;The Beatles;Isaac Newton;Scooby Doo;Voldemort;"+
	"Elvis Presley;Achilles;Pablo Picasso;Darth Vader;Barbie;Iron Man;"+
	"Vincent Van Gogh;Santa Claus;The Hulk;Harry Houdini;"+
	"Papa Smurf;Puss in Boots;Mozart;Superman;Gandhi;Optimus Prime;E.T;Micky Mouse;Tarzan;"+
	"John Lennon;Clark Kent;The Joker;Buzz Lightyear;Captain Jack Sparrow;Mohammad Ali;Easter Bunny;"+
	"Stewie Griffin;Popeye;Stephen Hawking;Yoda;Joe Armstrong").split(";");

var movies = ("Movie;The Truman Show;Aladdin;Spiderman;Cars;The Terminator;"+
	"Harry Potter;The Matrix;E.T.;Shrek;Star Wars;Toy Story;Tarzan;Batman;The Incredibles;"+
	"Monty Python and the Holy Grail;Fight Club;A Bugs Life;James Bond;Remember the Titans;"+
	"Indiana Jones;High School Musical;The Little Mermaid;Brother Bear;"+
	"The Lord of the Rings;The Wizard of Oz;Snow White;Avatar;Rocky;Jaws;The Godfather;Apollo 13;Ratatouille;"+
	"Alice in Wonderland;The Green Mile;Sleeping Beauty;The Shawshank Redemption;Finding Nemo;The Lion King;"+
	"Bambi;Peter Pan;Cinderella;Robin Hood;Pirates of the Caribbean;The Great Gatsby").split(";");


var series = ("Series;Pokemon;NCIS;The Simpsons;The Big Bang Theory;Breaking Bad;MythBusters;"+
	"How I Met Your Mother;Two and a Half Men;ER;Charlie's Angels;Beavis and Butthead;The Addams Family").split(";");

var books = ("Book;The Hobbit;James Bond;The Da Vinci Code;Curious George;Frankenstein;"+
	"Huckleberry Finn;Winnie-the-Poohe;Alice's Adventures In Wonderland;The Neverending Story;"+
	"The Great Gatsby;Twilight;The Picture of Dorian Gray").split(";");


db.charades_dictionary.insert(joinCollections([easy, moderate, hard, very_hard, animals ,idiom, characters, movies, series, books]));

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