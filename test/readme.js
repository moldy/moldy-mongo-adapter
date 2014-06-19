var Moldy = require('moldy'),
	should = require('should'),
	moldyFileAdapter = require('../src');

describe('moldy-mongo-adapter', function () {

	it('Tell `Moldy` to use the `mongo` adapter', function () {
		// Moldy.use( require('moldy-mongo-adapter') );
		// Moldy.adapters.mongodb.config.databaseName = 'moldyMongoAdapterTests';
		// Moldy.adapters.mongodb.config.connectionString = 'mongodb://127.0.0.1:27017/';
	});

	require('./readme/create');
	require('./readme/findOne');
	require('./readme/find');
	require('./readme/save');
	require('./readme/destroy');

});