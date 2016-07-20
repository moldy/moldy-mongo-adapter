var MongoClient = require('mongodb').MongoClient,
	baseAdapter = require('moldy-base-adapter'),
	ObjectID = require('mongodb').ObjectID,
	dotNotation = require('mongo-dot-notation');

var config = {
	connectionString: 'mongodb://127.0.0.1:27017/',
	databaseName: 'MoldyModelsUnnamed',
	options: {
		server: {}
	}
};

var db;

var connect = function (callback) {
	var self = this;

	//Already setup.
	if (db) return callback(null, db);

	var connected = function (_error, _db) {
		if (_error) return callback(_error);
		db = self._db = _db;
		callback(null, db);
	};

	//Newer way of connecting
	if (process.env.MONGO_CONNECTION_STRING) {
		return MongoClient.connect(process.env.MONGO_CONNECTION_STRING, connected);
	}

	var cs = self.config.connectionString ? self.config.connectionString : config.connectionString,
		dbName = self.config.databaseName ? self.config.databaseName : config.databaseName,
		options = self.config.options ? self.config.options : config.options;

	MongoClient.connect(cs + dbName, options, connected);
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

	if (ObjectID.isValid(newItem.id)) {
		newItem._id = new ObjectID(newItem.id);
	}

	delete newItem.id;

	return newItem._id ? newItem : null;
}

module.exports = baseAdapter.extend({
	name: "mongodb",
	create: function (data, done) {
		var self = this,
			col;

		connect.call(self.__adapter.mongodb, function (err, db) {
			if (err) return done(err);

			col = getCollection.call(self, db);

			delete data.id;

			col.insert(data, function (err, dbItems) {
				if (err) return done(err);
				if (dbItems.ops.length !== 1) return done(new Error('MongoDb returned an unexpected amount of items on insert'));

				var dbItem = mongoToMoldy(dbItems.ops[0]);

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
				if (ObjectID.isValid(id)) {
					query._id = new ObjectID(id);
					delete query.id;
				}
			}

			col.findOne(query, function (err, dbItem) {
				if (err) return done(err);
				if (!dbItem) {
					return done(null, undefined);
				}

				dbItem = mongoToMoldy(dbItem);

				done(null, dbItem);
			});
		});
	},
	find: function (query, done) {
		var self = this,
			col;

		connect.call(self.__adapter.mongodb, function (err, db) {
			if (err) return done(err);

			col = getCollection.call(self, db);

			// extract any page/ordering options
			var field,
				fields = {},
				orderBy,
				page,
				perPage;

			if (query.__orderBy) {
				orderBy = query.__orderBy;
				delete query.__orderBy;
			}
			if (query.__page) {
				page = parseInt(query.__page, 10);
				perPage = 20;
				delete query.__page;
			}
			if (query.__perPage) {
				perPage = parseInt(query.__perPage, 10);
				delete query.__perPage;
			}

			var cursor;
			if (typeof orderBy !== 'object') {
				cursor = col.find(query || {});
			} else {
				cursor = col.find(query || {}, orderBy);
			}

			// page out results
			if (page) {
				cursor.skip((page - 1) * perPage).limit(perPage);
			}

			// ordering
			if (orderBy) {
				if (typeof orderBy !== 'object') {
					orderBy = orderBy.split(',');

					for (var i = 0; i < orderBy.length; i++) {
						if (orderBy.hasOwnProperty(i)) {
							field = orderBy[i];
							// could be 'field' or '-field'
							if (field.match(/^\-/)) {
								fields[field.replace(/^\-/, '')] = -1;
							} else {
								fields[field] = 1;
							}
						}
					}
					cursor.sort(fields);
				} else {
					cursor.sort(orderBy);
				}

			}

			cursor.toArray(function (err, dbItems) {
				if (err) return done(err);

				dbItems.forEach(function (dbItem) {
					dbItem = mongoToMoldy(dbItem);
				});

				done(null, dbItems);
			});
		});
	},
	save: function (data, isDirectOperation) {
		var self = this,
			col,
			done = arguments[arguments.length - 1];
		isDirectOperation = typeof isDirectOperation === 'function' ? false : isDirectOperation;

		connect.call(self.__adapter.mongodb, function (err, db) {
			if (err) return done(err);

			col = getCollection.call(self, db);

			var options = {
				remove: false,
				new: true, //returns the modified record
				upsert: false
			};

			// If its a direct operation specifying the _id in the data means we want to do a upsert
			if (data._id) {
				options.upsert = true;
			}

			data = moldyToMongo(data);

			if (!data) return done(new Error('Can not save data that has no id'), 0);


			var _id = data._id;

			// Query
			var query = {
				_id: _id
			};

			// Sort order
			var sort = [
				['_id', 'asc']
			];

			var updateQuery;

			if (isDirectOperation) {
				if (!options.upsert) {
					delete data['_id'];
				}
				updateQuery = data;
			} else {
				// Flatten the data into dot notation
				// https://www.npmjs.com/package/mongo-dot-notation#convert-a-simple-object
				updateQuery = dotNotation.flatten(data);
				delete updateQuery.$set._id;
			}

			var saveDone = function (err, updateResponse) {
				if (err) return done(err);
				if (updateResponse.ok !== 1) return done(new Error('MongoDb returned an unexpected amount of items on save: ' + updateCount));
				done(null, updateResponse.value);
			};
			col.findAndModify(query, sort, updateQuery, options, saveDone);
		});
	},
	destroy: function (data, done) {
		var self = this,
			col,
			query = {};

		if (ObjectID.isValid(data.id)) {
			query._id = new ObjectID(data.id);
		} else {
			//TODO: Add support for query deletes.
			return done(null, 0);
		}

		connect.call(self.__adapter.mongodb, function (err, db) {
			if (err) return done(err);

			col = getCollection.call(self, db);

			col.remove(query, function (err, count) {
				if (err) return done(err);

				done(null, count);
			});

		});
	}
});
