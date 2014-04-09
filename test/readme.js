var Moldy = require('moldy'),
	should = require('should'),
	moldyFileAdapter = require('../src');

Moldy.use(require('../src'));

describe('moldy-file-adapter', function () {

	it('Tell `Moldy` to use the `file` adapter', function () {
		// Moldy.use( require('moldy-file-adapter') );
	});

	require('./readme/create');
	require('./readme/get');
	require('./readme/collection');
	require('./readme/save');
	require('./readme/destroy');

});