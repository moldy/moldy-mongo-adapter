var Moldy = require('moldy'),
	should = require('should');

describe('create', function () {

	this.timeout(5000);
	this.slow(5000);

	before(function () {
		Moldy.use(require('../../src'));
		Moldy.adapters.mongodb.config.databaseName = 'moldyMongoAdapterTests';
	});

	it('should `create` by a property', function (_done) {
		var personMoldy = Moldy.extend('person', {
			properties: {
				name: '',
				age: ''
			}
		}).create();

		personMoldy.name = 'David';

		personMoldy.$save(function (_error) {

			personMoldy.name.should.eql('David');
			_done(_error);

		});
	});

});