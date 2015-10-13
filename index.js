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


var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://db_user:db_user123@ds033734.mongolab.com:33734/wzorce';

//insertData({name:'abc', usersNum:5});
//findRooms(increaseUsersNum, {name:"abc"});
//decreaseUsersNum("abc");

var users = {};
var rooms = [];
var numUsers = 0;

io.on('connection', function(socket) {
	socket.on('update rooms', function() {
		socket.emit('update rooms', sortRooms());
	});

	socket.on('welcome', function(user) {
		socket.name = user.name;
		socket.room = user.room;
		socket.join(socket.room);
		

		//findRooms(increaseUsersNum, {name: socket.room});




		var i = findRoom(socket.room);
		if(i == -1) {
			rooms.push({
				name:		socket.room,
				numUsers:	1
			});
		} else {
			rooms[i].numUsers += 1;
		}
		io.emit('update rooms', sortRooms());
	
		users[socket.id] = {
			name:	socket.name,
			room:	socket.room
		};
		numUsers++;
		
		console.log('User ' + socket.name + ' added to room ' + socket.room + 
			' - numUsers: ' + rooms[findRoom(socket.room)].numUsers);
	});
	
	socket.on('mouse down', function(msg) {
	  	socket.broadcast.to(socket.room).emit('mouse down', msg);
	});
	

	socket.on('mouse drag', function(msg) {
	  	socket.broadcast.to(socket.room).emit('mouse drag', msg);
	});
	
	socket.on('message', function(msg) {
	  	io.to(socket.room).emit('message', msg);
	});
	
	socket.on('disconnect', function() {
		var i = findRoom(socket.room);
		if(i != -1) {
			--rooms[i].numUsers;
			console.log('User ' + socket.name + ' removed from room ' + socket.room + ' - numUsers: ' + rooms[i].numUsers);
		
			if(rooms[i].numUsers == 0) {
				rooms.splice(i, 1);
				io.emit('remove room', socket.room);
			}
		}
		delete users[socket.id];
		--numUsers;
		io.emit('update rooms', sortRooms());
	});
	
	function sortRooms() {
		return rooms.sort(function(a, b) {
			return b.numUsers - a.numUsers;
		});
	}
	
	
	function findRoom(roomName) {
		for(var i = 0; i < rooms.length; i++) {
			if(rooms[i].name == roomName) return i;
		}
		return -1;
	}
});


function increaseUsersNum(room) {
	updateRooms({name: room[0].name}, {$inc: { usersNum: 1}});
}

function decreaseUsersNum(room) {
	updateRooms({name: room.name}, {$inc: { usersNum: -1 }});
}

//$set: modified
//$inc: { quantity: 1, "metrics.orders": 1 }

function updateRooms(conditions, modification) {
	MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  db.collection('rooms').updateOne(conditions,
				modification,
        {$currentDate: { "lastModified": true }}
      , function(err, results) {
  					db.close();
  			});
		});
};

function findRooms(callback, conditions) {
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		db.collection('rooms').find(conditions).toArray(function (err, docs) {
				//console.log(err);
   			callback(docs);
		   	db.close();
		});
	});
};

function insertData(data) {
	MongoClient.connect(url, function(err, db) {
  	assert.equal(null, err);
		db.collection('rooms').insertOne(data, function(err, result) {
			assert.equal(err, null);
			console.log("Inserted a document into the restaurants collection.");
	 		db.close();
		});
	});
};
	

