var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var sio = require('socket.io');
var port = process.env.PORT || 5000;

var db;
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://db_user:db_user123@ds033734.mongolab.com:33734/wzorce';

var lessMiddleware = require('less-middleware');
var blackjackRequire = require('./index_blackjack.js');
var charadesRequire = require('./index_charades.js');
var auxiliaryRequire = require('./index_auxiliary.js');
var socketRequire = require('./index_socket.js');

MongoClient.connect(url, function(err, database) {
		assert.equal(null, err);
		db = database;
		//server.listen(port);
		//console.log("Listening on " + port);
	});


	
server.listen(port);
console.log("Listening on " + port);
var io = sio.listen(server);

app.use(lessMiddleware(__dirname + '/public',{
    debug: true,
    dest: __dirname + '/public',
    force: true,
    once: false
}));

app.use(express.static(__dirname + '/public'));

app.set('view engine','ejs');

app.get('/charades', function(req, res) {
	res.render('charades');
});

app.get('/charades/rooms', function(req, res) {
  res.send(games["charades"].rooms);
});

app.get('/blackjack', function(req, res) {
	res.render('blackjack');
});

app.get('/blackjack/rooms', function(req, res) {
  res.send(games["blackjack"].rooms);
});

var roomsIntervals = {};
var games = {};

games["blackjack"] = {
		rooms: []
	}
games["blackjack"].createRoom = blackjackRequire.createRoom;
games["blackjack"].createPlayer = blackjackRequire.createPlayer;


games["charades"] = {
		rooms: []
	}

games["charades"].createRoom = charadesRequire.createRoom;
games["charades"].createPlayer = charadesRequire.createPlayer;

io.on('connection', function(socket) {
		socketRequire.setOnWelcome(socket, games, io, roomsIntervals);
		socketRequire.setOnDisconnect(socket, games, io, roomsIntervals);
		socketRequire.setOnMessage(socket, io);
		socketRequire.setOnMouseDown(socket);
		socketRequire.setOnMouseDrag(socket);
});