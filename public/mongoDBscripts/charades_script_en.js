db.charades_dictionary.drop();


var easy = ("Stop;Alligator;Dance;Skip;Football;Kick;Head;Sunglasses;Mosquito;Pinch;Chair;Jump;Elephant;"+
	"Scissors;Point;Star;Tree;Airplane;Tail;Basketball;Mouth;Telephone;Chin;Jar;Smile;Cheek;Ear;Drum;Room;"+
	"Turtle;Wings;Doll;Bird;Spider;Hopscotch;Happy;Baby;Monkey;Pig;Jump;Crayon;Arm;Arm;Rabbit;Book;Camera;"+
	"Rock;Chicken;Robot;Mosquito;Pinch;Chair;Jump;Elephant;Scissors;Point;Star;Tree;Airplane;Tail;Basketball;"+
	"Mouth;Telephone;Chin;Jar;Smile;Cheek;Ear;Drum;Room;Turtle;Wings;Doll;Bird;Spider;Hopscotch;Happy;Baby;"+
	"Monkey;Pig;Jump;Crayon;Arm;Arm;Rabbit;Book;Camera;Rock;Chicken;Robot;Drink;Balloon;Kangaroo;Clap;Baseball;"+
	"Milk;Icecream;Circle").split(";");


var moderate = ("Wink;Ball;Rope;Elbow;Beg;Rollerblade;Summer;Cow;Fang;Table tennis;Snowball;Guitar;Alarm;"+
	"Cape;Bird;Saddle;Rain;Bike;Roof;Blind;Hoop;Violin;Coil;Goldfish;Frankenstein;Stairs;Dog;String;Fetch;"+
	"Cage;Mailbox;Spider man;Puppet;Penguin;Shovel;Popcorn;Butter;Trumpet;Haircut;Shopping trolley;Lipstick;"+
	"Soap;Hula;Mop;Money;Food;Glue;Banana;Hot;Violin;Coil;Goldfish;Frankenstein;Stairs;Dog;String;Fetch;Cage;"+
	"Mailbox;Spider man;Puppet;Penguin;Shovel;Popcorn;Butter;Trumpet;Haircut;Shopping trolley;Lipstick;Soap;"+
	"Hula;Mop;Money;Food;Glue;Banana;Hot;See-saw;Jellyfish").split(";");


var hard = ("Gingerbread;Lawn mower;Peck;Windmill;Bobsled;Sand;Year;Stain;Vest;Swordfish;Pizza;Softball;"+
	"Party;Wrench;Hair;Spine;Beetle;Trip;Gym;Sip;Torch;Cowboy;Carrot;Spider web;Beggar;Lung;Basket;Flamingo;"+
	"Cuff;Dryer;Blinds;Brain;Business;Eraser;Volcano;Whisk;Funny;Quicksand;Trap;Sheet;Small;Mouse;Poison;"+
	"Washing;Marble;Nightmare;Vegetable;Anger;Knot;Softball;Party;Wrench;Hair;Spine;Beetle;Trip;Gym;Sip;Torch;"+
	"Cowboy;Carrot;Spider web;Beggar;Lung;Basket;Flamingo;Cuff;Dryer;Blinds;Brain;Business;Eraser;Volcano;Whisk;"+
	"Funny;Quicksand;Trap;Sheet;Small;Mouse;Poison;Washing;Marble;Nightmare;Vegetable;Anger;Knot;Badge;Bubble;"+
	"Cramp;Doghouse;Mirror;Doctor;Wig").split(";");

var very_hard = ("Calendar;Organize;Killer;Channel;Pinboard;Shipwreck;Chuck norris;Defect;Mine;Bubble;Hydrant;"+
	"Alphabet;Journal;Advertise;Personal;Jet lag;Flag;Teenager;Invitation;Streamline;Pendulum;Carpenter;Shrink;"+
	"Tachometer;Olive oil;Boundary;Explore;Shaft;Music;Conversation;Application;Tomato sauce;Pompous;Police;"+
	"Island;Unemployed;Faucet;Computer monitor;Lifestyle;Mozart;Apathy;Level;Portfolio;Evolution;Train;Dismantle;"+
	"Lettuce;Crumbs;Daughter;Shipwreck;Chuck norris;Defect;Mine;Bubble;Hydrant;Alphabet;Journal;Advertise;Personal;"+
	"Jet lag;Flag;Teenager;Invitation;Streamline;Pendulum;Carpenter;Shrink;Tachometer;Olive oil;Boundary;Explore;Shaft;"+
	"Music;Conversation;Application;Tomato sauce;Pompous;Police;Island;Unemployed;Faucet;Computer monitor;Lifestyle;"+
	"Mozart;Apathy").split(";");


var idiom = ("Bite your tongue;A slap on the wrist;You can't judge a book by its cover;Off on the wrong foot;"+
	"Grab the bull by the horns;Beating around the bush;Piece of cake;Never bite the hand that feeds you;"+
	"Out of this world;All bark and no bite;A chip on your shoulder;Water under the bridge;"+
	"Make a mountain out of a molehill;Pull the wool over your eyes;Finger lickin' good;Method to my madness;"+
	"Once in a blue moon;On the same page;Hit the nail on the head;Have a cow;Gut feeling;Tongue-in-cheek;"+
	"Bend over backwards;Carry a tune;Pedal to the metal;Between a rock and a hard place;Curiosity killed the cat;"+
	"A drop in the bucket;Start from scratch;Throw a fit;A piece of cake;Up a creek without a paddle;Green with envy;"+
	"Don't put all your eggs in one basket;Tie the knot;Cost an arm and a leg;Take a hike;"+
	"Pipe down;Wear your heart on your sleeve;Kick the bucket;A wolf in sheep's clothing;Pulling your leg;"+
	"Spitting image;A fool and his money are easily parted;Two left feet;When in rome;Drive me up the wall;"+
	"In the bag;Over my dead body;Out of this world;All bark and no bite;A chip on your shoulder").split(";");

var characters = ("Stephen Hawking;Yoda;Thomas Edison;Leonardo DiCaprio;Socrates;Satan;Neil Armstrong;"+
	"Indiana Jones;Spider Man;Sherlock Holmes;Albert Einstein;Winnie the Pooh;Shakespeare;Snoopy;"+
	"Kermit the Frog;Christopher Columbus;Abraham Lincoln;The Beatles;Isaac Newton;Scooby Doo;Voldemort;"+
	"King Arthur;Sigmund Freud;Elvis Presley;Achilles;Dr. Seuss;Pablo Picasso;Darth Vader;Barbie;Iron Man;"+
	"Vincent Van Gogh;Henry Ford;Santa Claus;Billy the Kid;Andy Griffith;Thomas Jefferson;The Hulk;Harry Houdini;"+
	"Papa Smurf;Puss in Boots;Mozart;Superman;Gandhi;Big Bird;Optimus Prime;E.T;Babe Ruth;Micky Mouse;Tarzan;"+
	"Benjamin Franklin;Chuck Norris;John Lennon;Charlie Brown;Weird Al Yankovic;Clark Kent;Sheldon Cooper;Death;"+
	"The Joker;Marry Poppins;Buzz Lightyear;Captain Jack Sparrow;Mohammad Ali;Robin Williams;Easter Bunny;"+
	"Stewie Griffin;Popeye;Stephen Hawking;Yoda").split(";");

var movies = ("The Truman Show;Aladdin;Spiderman;Full Metal Jacket;Dumbo;The Parent Trap;Cars;The Terminator;"+
	"Harry Potter;The Mighty Ducks;The Matrix;E.T.;Shrek;Star Wars;Toy Story;Tarzan;Batman;The Incredibles;"+
	"Monty Python and the Holy Grail;Fight Club;A Bugs Life;James Bond;Remember the Titans;Reservoir Dogs;"+
	"Indiana Jones;High School Musical;Leon: The Professional;The Little Mermaid;Brother Bear;Marry Poppins;"+
	"The Lord of the Rings;The Wizard of Oz;Snow White;Avatar;Rocky;Jaws;The Godfather;Apollo 13;Ratatouille;"+
	"Alice in Wonderland;The Green Mile;Sleeping Beauty;The Shawshank Redemption;Finding Nemo;The Lion King;"+
	"Bambi;Peter Pan;Cinderella;Robin Hood;Good Will Hunting;Pirates of the Caribbean;The Truman Show;Aladdin;"+
	"Spiderman;Full Metal Jacket;Dumbo;The Parent Trap;Cars;The Terminator;Harry Potter;The Mighty Ducks;"+
	"The Matrix;E.T.;Shrek;Star Wars;Toy Story;Tarzan;Batman;The Incredibles;Monty Python and the Holy Grail;"+
	"Fight Club;A Bugs Life;James Bond;Remember the Titans;Reservoir Dogs;Indiana Jones;High School Musical;"+
	"Leon: The Professional;The Little Mermaid;Brother Bear;Marry Poppins;The Lord of the Rings;The Wizard of Oz;"+
	"Snow White;Avatar;Rocky;Jaws;The Godfather;Apollo 13;Ratatouille").split(";");


var series = ("Boston Legal;Avatar: The Last Airbender;Merlin;Grey's Anatomy;Kim Possible;Pokemon;NCIS;"+
	"King of the Hill;Star Wars: The Clone Wars;The Simpsons;The Big Bang Theory;Breaking Bad;MythBusters;"+
	"How I Met Your Mother;Two and a Half Men;Rugrats;Home Improvement;Smallville;ER;American Dad;Law & Order;"+
	"Batman: The Animated Series;Charlie's Angels;The A-Team;House;Chuck;Beavis and Butthead;"+
	"The Addams Family;The Drew Carey Show").split(";");

var books = ("La Confidential by James Ellroy;The Call of the Wild by Jack London;White Fang by Jack London;"+
	"The Hobbit by J. R. R. Tolkien;James Bond by Ian Fleming;The Da Vinci Code by Dan Brown;"+
	"A Tale of Two Cities by Charles Dickens;The Eagle Has Landed by Jack Higgins;"+
	"To Kill A Mockingbird by Harper Lee;Jaws by Peter Benchley;Where the Wild Things Are by Maurice Sendak;"+
	"Hitchhiker's Guide to the Galaxy by Douglas Adams;Curious George by Hans Augusto Rey and Margret Rey;"+
	"Moby-Dick by Herman Melville;Emma by Jane Austen;Frankenstein by Mary Shelley;"+
	"The Lion the Witch and the Wardrobe - C. S. Lewis;Huckleberry Finn by Mark Twain;Winnie-the-Pooh by A. A. Milne;"+
	"And Then There Were None by Agatha Christie;Alice's Adventures In Wonderland by Lewis Carroll;"+
	"David Copperfield by Charles Dickens;The Neverending Story by Michael Ende;The Great Gatsby by F. Scott Fitzgerald;"+
	"Twilight by Stephenie Meyer;Catch-22 by Joseph Heller;Watership Down by Richard Adams;"+
	"The Picture of Dorian Gray by Oscar Wilde").split(";");


var words = easy.concat(moderate).concat(hard).concat(very_hard).concat(idiom).concat(characters).concat(movies).concat(series).concat(books);


db.charades_dictionary.insert(translateToJSON(words));

function translateToJSON(list) {
	var result = [];
	for(var i = 1; i < list.length; i++) {
		result.push({ 
			"word": list[i]
		});
	}
	return result;
}