var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var sio = require('socket.io');
var port = process.env.PORT || 5000;

server.listen(port);
var io = sio.listen(server);


app.use(express.static(__dirname + '/public'));
app.set('view engine','ejs');

app.get('/charades', function(req, res) {
	res.render('charades');
});


io.on('connection', function(socket) {
	socket.on('mouse down', function(data) {
		socket.broadcast.emit('mouse down', data);
	});
	
	socket.on('mouse drag', function(data) {
		socket.broadcast.emit('mouse drag', data);
	});
	
	socket.on('disconnect', function() {
		
	});
});
	

