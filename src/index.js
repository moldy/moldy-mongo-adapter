var MongoClient = require('mongodb').MongoClient,
	baseAdapter = require('moldy-base-adapter'),
	ObjectID = require('mongodb').ObjectID;

var config = {
	connectionString: 'mongodb://127.0.0.1:27017/',
	databaseName: 'MoldyModelsUnnamed'
};

var db;

var connect = function (callback) {
	var cs = this.config.connectionString ? this.config.connectionString : config.connectionString,
		dbName = this.config.databaseName ? this.config.databaseName : config.databaseName;

	if (db) return callback(null, db);

	MongoClient.connect(cs + dbName, function (_error, _db) {
		if (_error) return callback(_error);
		db = _db;
		callback(null, db);
	});
};

var getCollection = function (db) {
	return db.collection(this.__name);
};

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

		connect.call(self.__adapter.mongodb, function (err, db) {
			if (err) return done(err);

			col = getCollection.call(self, db);

			col.insert(moldyToMongo(data), function (err, dbItems) {
				if (err) return done(err);
				if (dbItems.length !== 1) return done(new Error('MongoDb returned an unexpected amount of items on insert'));

				var dbItem = mongoToMoldy(dbItems[0]);

				done(null, dbItem);
			});

		});
	},
	findOne: function (query, done) {
		var self = this,
			col;

		connect.call(self.__adapter.mongodb, function (err, db) {
			if (err) return done(err);

			var id = typeof query === 'object' && query.id ? query.id : '';

			col = getCollection.call(self, db);

			if (query.id) {
				try {
					query._id = new ObjectID(id);
					delete query.id;
				} catch (e) {}
			}

			col.findOne(query, function (err, dbItem) {
				if (err) return done(err);
				if (!dbItem) return done(new Error('The item {' + id + '} could not be found'), undefined);

				dbItem = mongoToMoldy(dbItem);

				done(null, dbItem);
			});
		});
	},
	find: function (query, done) {
		var self = this,
			col;

		connect.call(self.__adapter.mongodb, function (err, db) {
			if (err) {
				return done(err);
			}

			col = getCollection.call(self, db);

			col.find(query || {}).toArray(function (err, dbItems) {
				if (err) return done(err);

				dbItems.forEach(function (dbItem) {
					dbItem = mongoToMoldy(dbItem);
				});

				done(null, dbItems);
			});
		});
	},
	save: function (data, done) {
		var self = this,
			col;

		connect.call(self.__adapter.mongodb, function (err, db) {
			if (err) return done(err);

			col = getCollection.call(self, db);

			data = moldyToMongo(data);

			col.save(data, function (err, updateCount) {
				if (err) return done(err);
				if (updateCount != 1) return done(new Error('MongoDb returned an unexpected amount of items on save'));

				done(null, updateCount);
			});
		});
	},
	destroy: function (data, done) {
		var self = this,
			col;

		connect.call(self.__adapter.mongodb, function (err, db) {
			if (err) return done(err);

			col = getCollection.call(self, db);
			data = moldyToMongo(data);

			col.remove({
				_id: new ObjectID(data._id)
			}, function (err, count) {
				if (err) return done(err);

				done(null, count);
			});

		});
	}
});