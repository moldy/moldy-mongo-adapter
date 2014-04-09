var Moldy = require('moldy'),
	should = require('should');

describe('save', function () {
	var key;

	it('should `save` a model', function (_done) {
		var personMoldy = new Moldy('person', {
			properties: {
				name: 'string',
				age: 'number'
			}
		});

		personMoldy.$get(function (_error) {

			if (_error) {
				return _done(_error);
			}

			key = personMoldy.id;
			personMoldy.name = 'Mr David';

			personMoldy.$save(function (_error) {

				if (_error) {
					return _done(_error);
				}

				var newPersonMoldy = new Moldy('person', {
					properties: {
						name: 'string',
						age: 'number'
					}
				});

				newPersonMoldy.$get({
					id: key
				}, function (_error) {

					newPersonMoldy.id.should.equal(key);
					_done(_error);

				});

			});

		});
	});

});