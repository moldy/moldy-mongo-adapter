var cast = require('sc-cast'),
	hasKey = require('sc-haskey'),
	MongoClient = require('mongodb').MongoClient,
	ObjectID = require('mongodb').ObjectID;

var LOGGING_ON = true,
	DEFAULT_DATABASE = 'MoldyModelsUnnamed';



module.exports = function (_model, _data, _method, _url, _callback) {
	var method = _method,
		model = _model,
		data = cast(_data, 'object', {});

	log(method, _data);
	
	MongoClient.connect('mongodb://127.0.0.1:27017/' + DEFAULT_DATABASE, function(err, db) {
		if(err) {
			return _callback(err);
		}
		var collectionName = _model.__name;

		var collection = db.collection(collectionName);
		log('collection', collectionName);

		switch (true) {
			case (/get/i.test(method)): // $get or $collection

				var data = moldyToMongo(_data);

				var findOptions = {};


				if (data._id) { //Get one item

					collection.findOne({_id: new ObjectID(data._id)}, function(err, dbItem) {
						if (err) {
							return _callback(err);
						}
						if (!dbItem) {
							//TODO: handle missing items better.
							log('Missing item', _data, data, dbItem);
							return _callback(null, null);
						}
						
						dbItem = mongoToMoldy(dbItem);

						log('$get res', dbItem);
						
						db.close();

						_callback(null, dbItem);
					});

				} else { //Get collection of items

					collection.find(data).toArray(function(err, dbItems) {
						if (err) {
							return _callback(err);
						}

						log('$collection pre-res', dbItems);

						dbItems.forEach(function(dbItem) {
							dbItem = mongoToMoldy(dbItem);							
						});


						log('$collection res', dbItems);
						
						db.close();

						_callback(null, dbItems);
					});

				}

				break;

			case (/post/i.test(method)): //$create

				var data = moldyToMongo(_data);

				collection.insert(data, function(err, dbItems) {
					if (err) {
						return _callback(err);
					}
					if (dbItems.length !== 1) {
						return _callback(new Error('MongoDb returned an unexpected amount of items on insert'));
					}

					var dbItem = dbItems[0];

					dbItem = mongoToMoldy(dbItem);

					log(method + ' res', dbItem);

					db.close();

					_callback(null, dbItem);

				});
				
				break;

			case (/put/i.test(method)): //$update
				
				//Copy and remove the id so mongo is happy
				var data = moldyToMongo(_data);

				collection.save(data, function(err, updateCount) {
					if (err) {
						return _callback(err);
					}
					if (updateCount != 1) {
						return _callback(new Error('MongoDb returned an unexpected amount of items on save'));
					}

					log(method + ' res', updateCount);

					db.close();

					_callback(null, updateCount);

				});

				break;

			case (/delete/i.test(method)): //$destroy

				var data = moldyToMongo(_data);

				collection.remove({_id: new ObjectID(data._id)}, function(err, count) {
					if (err) {
						return _callback(err);
					}
					
					log(method + ' res', count);
					
					db.close();

					_callback(null, count);
				});
				
				break;
		}



		
	});

}


function log() {
	if(LOGGING_ON){
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
		newItem._id = newItem.id;
		delete newItem['id'];
	}
	return newItem;	
}