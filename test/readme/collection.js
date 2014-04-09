var Moldy = require('moldy'),
	should = require('should');

describe('collection', function () {

	it('should `get` a `collection`', function (_done) {
		var personMoldy = new Moldy('person', {
			properties: {
				name: 'string',
				age: 'number'
			}
		});

		personMoldy.$collection(function (_error, _people) {

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