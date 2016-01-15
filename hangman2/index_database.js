var db;
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = "mongodb://db_user:wzorce123@ds033734.mongolab.com:33734/wzorce";


MongoClient.connect(url, function(err, database) {
	assert.equal(null, err);
	db = database;
	console.log("Connected to database");
});


module.exports.setRandomWord = function(room) {
	db.collection("pictionary_dictionary").find().toArray(function (err, docs) {
		assert.equal(err, null);
  		room.currentWord = docs[Math.floor(Math.random() * docs.length)];
 	});
};

module.exports.addUser = function(user, callback) {
	db.collection("users").find({ "name": user.name }).toArray(function (err, docs) {
		if(docs.length == 0) {
			db.collection("users").insertOne({
		    	"name" : user.name,
		    	"password": user.password
		   	}, function(err, result) {
		    	assert.equal(err, null);
		    	console.log("Inserted a document into the users collection.");
			    db.collection("users_statistics").insertOne({
			    	"name" : user.name,
			    	"overallPoints": 100,
			    	"overallTime": 0,
			    	"friends": []
				}, function(err, result) {
					assert.equal(err, null);
				    console.log("Inserted a document into the users_statistics collection.");
				    callback(1, user);
				});
			});
		} else {
			console.log("User already exits");
			callback(0, user);
		};
	});
};

module.exports.validateUser = function(user, callback) {
	db.collection("users").find({ "name": user.name, "password": user.password }).toArray(function (err, docs) {
		if(docs.length == 0) {
			console.log("Wrong user name or password");
			callback(0, user);
		} else {
			console.log("Successfully logged in");
			callback(1, user);
		};
	});
};


module.exports.retrieveUser = function(user, callback) {
	db.collection("users_statistics").find({ "name": user.name }).toArray(function (err, docs) {
		if(docs.length == 0) {
			console.log("Something went wrong");
			callback(0, user);
		} else {
			console.log("Statictics successfully fetched");
			callback(1, docs[0]);
		};
	});
};


module.exports.updateUserStatistics = function(user, startTime) {
	db.collection("users_statistics").updateOne(
		{ 
			"name" : user.name 
		},
		{
    		$set: { 
    			"overallPoints": user.overallPoints
    		},
    		$inc: {
    			"overallTime": (new Date()).getTime() - startTime
    		}
    	},function(err, results) {
	      //console.log(results);
	   });
}

module.exports.addFriend = function(name, friend) {
	db.collection("users_statistics").updateOne(
		{ 
			"name" : name 
		},
		{
    		$push: { 
    			"friends": friend
    		}
    	},function(err, results) {
	      //console.log(results);
	   });
}

module.exports.getFriends = function(name, callback) {
	db.collection("users_statistics").find({ "name": name }).toArray(function (err, docs) {
		if(docs.length == 0) {
			console.log("Cannot fetch friends");
			callback(0, undefined);
		} else {
			console.log("Friends successfully fetched");
			callback(1, docs[0].friends);
		};
	});
}

module.exports.getWordForHangman = function(room, callback) {
	db.collection("pictionary_dictionary").find().toArray(function (err, docs) {
		assert.equal(err, null);
  		room.wordsList = docs;
  		callback();
 	});
};