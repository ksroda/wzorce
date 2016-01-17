var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var sio = require('socket.io');
var parseurl = require('parseurl')
var session = require('express-session')
var port = process.env.PORT || 5000;

var bodyParser = require('body-parser');
var lessMiddleware = require('less-middleware');
var blackjackRequire = require('./index_blackjack.js').getInstance();
var pictionaryRequire = require('./index_pictionary.js').getInstance();
var hangmanRequire = require('./index_hangman.js').getInstance();
var auxiliaryRequire = require('./index_auxiliary.js')();
var socketRequire = require('./index_socket.js');
var databaseRequire = require('./index_database.js');

server.listen(port);
console.log("Listening on " + port);
var io = sio.listen(server);

app.use(bodyParser.urlencoded({ extended: true }))
//app.use(bodyParser.json());

app.use(session({
  secret: 'marekkamilapaulina',
  resave: false,
  saveUninitialized: true
}))

app.use(lessMiddleware(__dirname + '/public',{
    debug: true,
    dest: __dirname + '/public',
    force: true,
    once: false
}));

app.use(express.static(__dirname + '/public'));

app.set('view engine','ejs');

app.get('/undefined', function(req, res) {
	res.redirect("/");
});

app.get('/', function(req, res) {
	renderPageForUser("homepage", req, res, undefined);
});

app.get('/login', function(req, res) {
	if(req.session.user) {
		res.redirect("/");
	} else {
		renderPageForUser("login", req, res, undefined);
	}
});

app.post('/login', function(req, res) {
	databaseRequire.validateUser(req.body, function(result, user) {
		if(result) {
			req.session.user = {
				name: user.name,
				password: user.password
			};
			res.redirect("/");
		} else {
			renderPageForUser("login", req, res, "Wrong username or password");
		}
	});
});


app.get('/register', function(req, res) {
	if(req.session.user) {
		res.redirect("/");
	} else {
		renderPageForUser("register", req, res, undefined);
	}
});

app.post('/register', function(req, res) {
	if(req.body.repeatpassword == req.body.password) {
		databaseRequire.addUser(req.body, function(result, user) {
			if(result) {
				res.redirect("/login");
			} else { 
				renderPageForUser("register", req, res, "User already exists");
			}
		});
	} else {
		renderPageForUser("register", req, res, "Passwords don't match");
	}
});

app.get('/logout', function(req, res) {
	if(req.session.user) {
		delete req.session.user;
		res.redirect("/login");
	} else {
		res.redirect("/");
	}
});


app.get('/hangman', function(req, res) {
	renderPageForUser("hangman", req, res, undefined);
});

app.get('/hangman/rooms', function(req, res) {
  res.send(auxiliaryRequire.objectToArray(games["hangman"].rooms));
});

app.get('/pictionary', function(req, res) {
	renderPageForUser("pictionary", req, res, undefined);
});

app.get('/pictionary/rooms', function(req, res) {
  res.send(auxiliaryRequire.objectToArray(games["pictionary"].rooms));
});

app.get('/blackjack', function(req, res) {
	renderPageForUser("blackjack", req, res, undefined);
});

app.get('/blackjack/rooms', function(req, res) {
  res.send(games["blackjack"].rooms);
});

app.get('/friends', function(req, res) {
  databaseRequire.getFriends(req.query.who, function(result, friends) {
  	if(result) {
  		res.send(friends);
  	} else {
  		res.send([]);
  	}
  });
});

app.get('/addfriend', function(req, res) {
	if(req.session.user.name == req.query.who) {
		databaseRequire.getFriends(req.query.who, function(result, friends) {
			databaseRequire.userExists(req.query.friend, function(result) {
				if(result) {
					if(friends.indexOf(req.query.friend) === -1) {
						databaseRequire.addFriend(req.query.who, req.query.friend, function(result, friends) {
							if(result) {
								res.send({
									friends: friends,
									message: "Friend successfully added",
									success: true
								});
							} else {
								res.send({
									friends: [],
									message: "Something bad happened",
									success: false
								});
							}
						});
					} else {
						res.send({
							friends: friends,
							message: req.query.friend  + " is already on your friends list",
									success: false
						});
					}
				} else {
					res.send({
						friends: friends,
						message: "User doesn't exist",
									success: false
					})
				}
			});
		});
	} else {
		res.send("You're not authorized to do that");
		console.log("Not authorized");
	}
});

app.get('/bonus', function(req, res) {
  res.render('bonus');
});

var socketUsers = {};
var roomsIntervals = {};
var games = {};

games["blackjack"] = blackjackRequire;
games["pictionary"] = pictionaryRequire;
games["hangman"] = hangmanRequire;

io.on('connection', function(socket) {
	socket.startTime = (new Date()).getTime();

	socket.on('login', function(login) {
		socketUsers[login] = socket.id;
	});

	// socket.on('add friend', function(data) {
		
	// });
	
	socketRequire.setOnWelcome(socket, games, io, roomsIntervals);
	socketRequire.setOnDisconnect(socket, games, io, roomsIntervals);
	socketRequire.setOnMessage(socket, io);
	socketRequire.setOnJoinChatRequest(socket, io);

	pictionaryRequire.setOnMouseDown(socket);
	pictionaryRequire.setOnMouseDrag(socket);
	pictionaryRequire.setOnChatMessage(io, socket);

	blackjackRequire.socketHandling(socket);

	hangmanRequire.setOnLetterSend(socket);
});



function renderPageForUser(site, req, res, message) {
	if(req.session.user) {
		databaseRequire.validateUser(req.session.user, function(result, user) {
			if(result) {
				renderPageForUserConfirmed(site, req, res, message);
			} else {
				res.redirect("/logout");
			}
		});
	} else {
		res.render(site, { 
			"user": randomGuestPlayer(),
			"message": message
		});
	}
}


function renderPageForUserConfirmed(site, req, res, message) {
	databaseRequire.retrieveUser(req.session.user, function(result, user) {
		if(result) {
			res.render(site, { 
				"user": {
					name: user.name,
					overallPoints: user.overallPoints,
					overallTime: user.overallTime,
					guest: false
				},
				"message": message
			});
		} else {
			res.redirect("/logout");
		};
	});
}


function randomGuestPlayer() {
	return {
		name: "Guest" + Math.floor(Math.random() * 1000),
		overallPoints: 100,
		overallTime: 0,
		friends: [],
		guest: true
	}
}