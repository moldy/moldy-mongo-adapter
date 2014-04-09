var Moldy = require('moldy'),
	should = require('should');

describe('collection', function () {

	it('should `get` a `collection`', function (_done) {
		var carMoldy = new Moldy('cars', {
			properties: {
				make: 'string',
				model: 'string'
			}
		});

		carMoldy.$collection(function (_error, _cars) {

			if (_error) {
				return _done(_error);
			}

			_cars.should.be.an.Array;
			_cars.length.should.greaterThan(0);

			_cars.forEach(function (_car) {
				_car.should.be.a.Moldy;
				_car.should.have.a.property('id');
				_car.should.have.a.property('make');
				_car.should.have.a.property('model');
				Object.keys(_car.$json()).should.have.a.lengthOf(3);
			});

			_done();

		});
	});

});