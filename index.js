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


MongoClient.connect(url, function(err, database) {
		assert.equal(null, err);
		db = database;
		server.listen(port);
		console.log("Listening on " + port);
	});
	
var io = sio.listen(server);

app.use(express.static(__dirname + '/public'));
app.set('view engine','ejs');

app.get('/charades', function(req, res) {
	res.render('charades');
});

app.get('/charades/rooms', function(req, res) {
	db.collection('rooms').find().toArray(function (err, docs) {
   	res.send(docs);
	});
});

//insertData({name:'abc', usersNum:5});
//findRooms(console.log, {});
//decreaseUsersNum("abc");


io.on('connection', function(socket) {
		game.setOnWelcome(socket);
		game.setOnDisconnect(socket);
		game.setOnMessage(socket);
		game.charades.setOnMouseDown(socket);
		game.charades.setOnMouseDrag(socket);
});

//--------------------------------------------------------------

var game = {
	setOnWelcome: function(socket) {
		socket.on('welcome', function(user) {
			socket.name = user.name;
			socket.room = user.room;
			socket.join(socket.room);

			db.collection('rooms').find({ name: socket.room }).toArray(function (err, docs) {
					assert.equal(err, null);
		 			if(docs.length > 0) {
		 				increaseUsersNum(socket.room);
		 			} else {
		 				insertRoom({
		 					name: 		socket.room,
		 					usersNum: 1
		 				});
		 			}
			});
		});
	},
	
	setOnDisconnect: function(socket) {
		socket.on('disconnect', function() {
		
		});
	},
	
	setOnMessage: function(socket) {
		socket.on('message', function(msg) {
				io.to(socket.room).emit('message', msg);
		});
	},
	//-----------------Charades-------------------------------------
	charades: {
		setOnMouseDown: function(socket) {
			socket.on('mouse down', function(msg) {
					socket.broadcast.to(socket.room).emit('mouse down', msg);
			});
		},
		
		setOnMouseDrag: function(socket) {
			socket.on('mouse drag', function(msg) {
					socket.broadcast.to(socket.room).emit('mouse drag', msg);
			});
		}
	}
}


//---------------------------------------------------------------

function sendRoomsUpdate(rooms) {
	io.emit('update rooms', rooms);
};

function increaseUsersNum(room) {
	updateRooms({ name: room }, {$inc: { usersNum: 1}});
}

function decreaseUsersNum(room) {
	updateRooms({ name: room }, {$inc: { usersNum: -1 }});
}

//$set: modified
//$inc: { quantity: 1, "metrics.orders": 1 }

function updateRooms(conditions, modification) {
  db.collection('rooms').updateOne(
  	conditions,
		modification,
    {$currentDate: { "lastModified": true }},
    function(err, results) {
  		assert.equal(err, null);
  		findRooms(sendRoomsUpdate, {});
  	});
};

function findRooms(callback, conditions) {
		db.collection('rooms').find(conditions).toArray(function (err, docs) {
				assert.equal(err, null);
   			callback(docs);
		});
};

function insertRoom(room) {
	db.collection('rooms').insertOne(room, function(err, result) {
		assert.equal(err, null);
		findRooms(sendRoomsUpdate, {});
	});
}
