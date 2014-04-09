var Moldy = require('moldy'),
	should = require('should'),
	moldyFileAdapter = require('../src');

Moldy.use(require('../src'));

describe('moldy-mongo-adapter', function () {

	it('Tell `Moldy` to use the `mongo` adapter', function () {
		// Moldy.use( require('moldy-mongo-adapter') );
	});

	require('./readme/create');
	require('./readme/get');
	require('./readme/collection');
	require('./readme/save');
	require('./readme/destroy');

});