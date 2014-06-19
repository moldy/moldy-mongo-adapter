var cast = require('sc-cast'),
	hasKey = require('sc-haskey'),
	MongoClient = require('mongodb').MongoClient,
	baseAdapter = require('moldy-base-adapter'),
	ObjectID = require('mongodb').ObjectID;

var LOGGING_ON = false,
	DEFAULT_DATABASE = 'MoldyModelsUnnamed';

var config = {
	connectionString: 'mongodb://127.0.0.1:27017/',
	databaseName: DEFAULT_DATABASE
};

var url = config.connectionString + config.databaseName;

var connect = function (callback) {

	var cs = this.config.connectionString ? this.config.connectionString : config.connectionString,
		dbName = this.config.databaseName ? this.config.databaseName : config.databaseName;

	MongoClient.connect(cs + dbName, callback);
};

var getCollection = function (db) {
	return db.collection(this.__name);
};

function log() {
	if (LOGGING_ON) {
		console.log.apply(console, arguments);
	}
}

//Swap IDs around to be moldy standard
function mongoToMoldy(item) {
	item.id = item._id.toString();
	delete item['_id'];
	return item;
}

//Swap IDs to be mongo standard
function moldyToMongo(item) {
	var newItem = JSON.parse(JSON.stringify(item));
	if (newItem.id) {
		newItem._id = new ObjectID(newItem.id);
		delete newItem['id'];
	}
	return newItem;
}

module.exports = baseAdapter.extend({
	name: "mongodb",
	create: function (data, done) {
		var self = this,
			col;

		connect.call(this.__adapter.mongodb, function (err, db) {
			if (err) {
				return done(err);
			}

			col = getCollection.call(self, db);

			col.insert(moldyToMongo(data), function (err, dbItems) {


				if (err) {
					return done(err);
				}

				if (dbItems.length !== 1) {
					return done(new Error('MongoDb returned an unexpected amount of items on insert'));
				}

				var dbItem = mongoToMoldy(dbItems[0]);

				db.close();

				done(null, dbItem);

			});

		});
	},
	findOne: function (query, done) {
		var self = this,
			col;

		connect.call(this.__adapter.mongodb, function (err, db) {
			if (err) {
				return done(err);
			}
			col = getCollection.call(self, db);

			if (query.id) {
				query = {
					_id: new ObjectID(query.id)
				}
			}

			col.findOne(query, function (err, dbItem) {
				if (err) {
					return done(err);
				}
				if (!dbItem) {
					//TODO: handle missing items better.
					log('Missing item', _data, data, dbItem);
					return done(null, null);
				}

				dbItem = mongoToMoldy(dbItem);

				log('$get res', dbItem);

				db.close();

				done(null, dbItem);
			});
		});
	},
	find: function (query, done) {
		var self = this,
			col;

		connect.call(this.__adapter.mongodb, function (err, db) {
			if (err) {
				return done(err);
			}

			col = getCollection.call(self, db);

			col.find(query || {}).toArray(function (err, dbItems) {

				if (err) {
					return done(err);
				}

				log('$collection pre-res', dbItems);

				dbItems.forEach(function (dbItem) {
					dbItem = mongoToMoldy(dbItem);
				});


				log('$collection res', dbItems);

				db.close();

				done(null, dbItems);
			});
		});
	},
	save: function (data, done) {
		var self = this,
			col;

		connect.call(this.__adapter.mongodb, function (err, db) {
			if (err) {
				return done(err);
			}

			col = getCollection.call(self, db);

			//Copy and remove the id so mongo is happy
			data = moldyToMongo(data);

			col.save(data, function (err, updateCount) {
				if (err) {
					return done(err);
				}
				if (updateCount != 1) {
					return done(new Error('MongoDb returned an unexpected amount of items on save'));
				}

				db.close();

				done(null, updateCount);
			});
		});
	},
	destroy: function (data, done) {
		var self = this,
			col;

		connect.call(this.__adapter.mongodb, function (err, db) {
			if (err) {
				return done(err);
			}

			col = getCollection.call(self, db);

			data = moldyToMongo(data);

			col.remove({
				_id: new ObjectID(data._id)
			}, function (err, count) {
				if (err) {
					return done(err);
				}

				db.close();

				done(null, count);
			});

		});
	}
});