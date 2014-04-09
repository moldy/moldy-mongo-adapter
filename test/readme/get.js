var Moldy = require('moldy'),
	should = require('should');

describe('get', function () {
	var newPersonId,
		schema;

	it('define a JSON schema', function () {
		schema = {
			properties: {
				name: 'string'
			}
		};
	});

	it('should create a new person so we can `get` it next', function (_done) {
		var personMoldy = new Moldy('person', schema);

		personMoldy.name = 'Mr Glen';

		personMoldy.$save(function (_error) {
			newPersonId = personMoldy.id;
			_done(_error);
		});
	});

	it('should `get` by a `id` from the previous example', function (_done) {
		var personMoldy = new Moldy('person', schema);

		personMoldy.$get({
			id: newPersonId
		}, function (_error, glen) {

			if (_error) {
				return _done(_error);
			}

			glen.name.should.eql('Mr Glen');
			glen.$destroy(_done);

		});
	});

});