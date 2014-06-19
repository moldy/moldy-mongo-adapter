var Moldy = require('moldy'),
	should = require('should');

describe('find', function () {

	before(function () {
		Moldy.use(require('../../src'));
		Moldy.adapters.mongodb.config.databaseName = 'moldyMongoAdapterTests';
	});

	it('should get an array of models', function (_done) {
		var personMoldy = Moldy.extend('person', {
			properties: {
				name: 'string',
				age: 'number'
			}
		});

		personMoldy.$find(function (_error, _people) {

			if (_error) {
				return _done(_error);
			}

			_people.should.be.an.Array;
			_people.length.should.greaterThan(0);

			_people.forEach(function (_person) {
				_person.should.be.a.Moldy;
				_person.should.have.a.property('id');
				_person.should.have.a.property('name');
				_person.should.have.a.property('age');
				Object.keys(_person.$json()).should.have.a.lengthOf(3);
			});

			_done();

		});
	});

});