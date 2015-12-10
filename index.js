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
var blackjackRequire = require('./index_blackjack.js')();
var charadesRequire = require('./index_charades.js')();
var auxiliaryRequire = require('./index_auxiliary.js')();
var socketRequire = require('./index_socket.js')();
var databaseRequire = require('./index_database.js');

server.listen(port);
console.log("Listening on " + port);
var io = sio.listen(server);

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

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

app.get('/', function(req, res) {
	renderPageForUser("homepage", req, res);
});

app.get('/login', function(req, res) {
	if(req.session.user) {
		res.redirect("/");
	} else {
		res.render('login', { "message": undefined } );
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
			res.render('login', { "message": "Wrong username or password" });
		}
	});
});


app.get('/register', function(req, res) {
	if(req.session.user) {
		res.redirect("/");
	} else {
		res.render('register', { "message": undefined });
	}
});

app.post('/register', function(req, res) {
	databaseRequire.addUser(req.body, function(result, user) {
		if(result) {
			res.redirect("/login");
		} else { 
			res.render('register', { "message": "User already exists" });
		}
	});
});

app.get('/logout', function(req, res) {
	if(req.session.user) {
		delete req.session.user;
		res.redirect("/login");
	} else {
		res.redirect("/");
	}
});

app.get('/charades', function(req, res) {
	res.render('charades');
});

app.get('/charades/rooms', function(req, res) {
  res.send(games["charades"].rooms);
});

app.get('/blackjack', function(req, res) {
	renderPageForUser("blackjack", req, res);
});

app.get('/blackjack/rooms', function(req, res) {
  res.send(games["blackjack"].rooms);
});

app.get('/bonus', function(req, res) {
  res.render('bonus');
});

var roomsIntervals = {};
var games = {};

games["blackjack"] = blackjackRequire;
games["charades"] = charadesRequire;

io.on('connection', function(socket) {
	socket.emit('id', socket.id);
	
	socketRequire.setOnWelcome(socket, games, io, roomsIntervals);
	socketRequire.setOnDisconnect(socket, games, io, roomsIntervals);
	//socketRequire.setOnMessage(socket, io);

	charadesRequire.setOnMouseDown(socket);
	charadesRequire.setOnMouseDrag(socket);
	charadesRequire.setOnChatMessage(io, socket);

	blackjackRequire.setOnActionChange(socket);
});



function renderPageForUser(site, req, res) {
	if(req.session.user) {
		databaseRequire.validateUser(req.session.user, function(result, user) {
			if(result) {
				renderPageForUserConfirmed(site, req, res);
			} else {
				res.redirect("/logout");
			}
		});
	} else {
		res.render(site, { 
			"user": randomGuestPlayer()
		});
	}
}



function renderPageForUserConfirmed(site, req, res) {
	databaseRequire.retrieveUser(req.session.user, function(result, user) {
		if(result) {
			res.render(site, { 
				"user": {
					name: user.name,
					overallPoints: user.overallPoints,
					overallTime: user.overallTime,
					guest: false
				}
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
		guest: true
	}
}