var Moldy = require('moldy'),
	should = require('should'),
	moldyFileAdapter = require('../src');

describe('moldy-mongo-adapter', function () {

	it('Tell `Moldy` to use the `mongo` adapter', function () {
		// Moldy.use( require('moldy-mongo-adapter') );
	});

	require('./readme/create');
	require('./readme/findOne');
	require('./readme/find');
	require('./readme/save');
	require('./readme/destroy');

});