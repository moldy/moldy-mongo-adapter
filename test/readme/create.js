var Moldy = require('moldy'),
	should = require('should');

describe('create', function () {

	it('should `create` by a property', function (_done) {
		var carMoldy = new Moldy('cars', {
			properties: {
				make: 'string',
				model: 'string'
			}
		});

		carMoldy.make = 'Bugatti';
		carMoldy.model = 'Veyron';

		carMoldy.$save(function (_error) {

			carMoldy.make.should.eql('Bugatti');
			carMoldy.model.should.eql('Veyron');
			_done(_error);

		});
	});

});