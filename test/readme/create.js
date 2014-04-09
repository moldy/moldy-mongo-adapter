var Moldy = require('moldy'),
	should = require('should');

describe('create', function () {

	it('should `create` by a property', function (_done) {
		var personMoldy = new Moldy('person', {
			properties: {
				name: '',
				age: ''
			}
		});

		personMoldy.name = 'Glen';

		personMoldy.$save(function (_error) {

			personMoldy.name.should.eql('Glen');
			_done(_error);

		});
	});

});