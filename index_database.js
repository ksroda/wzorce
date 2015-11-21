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
	db.collection("charades_dictionary").find().toArray(function (err, docs) {
		assert.equal(err, null);
  		room.currentWord = docs[Math.floor(Math.random() * docs.length)];
 	});
};