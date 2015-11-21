var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var sio = require('socket.io');
var port = process.env.PORT || 5000;


var lessMiddleware = require('less-middleware');
var blackjackRequire = require('./index_blackjack.js');
var charadesRequire = require('./index_charades.js');
var auxiliaryRequire = require('./index_auxiliary.js');
var socketRequire = require('./index_socket.js');

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
	socketRequire.setOnMessage(socket, io);

	charadesRequire.setOnMouseDown(socket);
	charadesRequire.setOnMouseDrag(socket);

	blackjackRequire.setOnActionChange(socket);
});