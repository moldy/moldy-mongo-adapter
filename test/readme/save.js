var Moldy = require('moldy'),
	should = require('should'),
	async = require('async');

describe('save', function () {
	var schema,
		key;

	this.timeout(5000);
	this.slow(5000);

	before(function () {
		Moldy.use(require('../../src'));
		Moldy.adapters.mongodb.config.databaseName = 'moldyMongoAdapterTests';
	});

	it('create a schema', function () {
		schema = {
			properties: {
				name: 'string',
				age: {
					type: 'number',
					default: 0
				},
				backpack: {
					keyless: true,
					properties: {
						mainCompartment: {
							type: 'string',
							default: 'comic books',
						},
						leftPocket: {
							type: 'string',
							default: 'chewing gum',
						}
					}
				},
				friends: [{
					keyless: true,
					properties: {
						name: {
							type: 'string',
							default: ''
						},
						age: {
							type: 'number',
							default: 0
						}
					}
				}]
			}
		};
	});

	it('should `save` a model', function (_done) {
		var personMoldy = Moldy.extend('person', schema);

		personMoldy.$findOne(function (_error, _person) {

			if (_error) {
				return _done(_error);
			}

			var person = _person;

			key = person.id;
			person.name = 'Mr David';
			person.friends.push({
				name: 'leonie'
			});
			person.friends.push({
				name: 'max'
			});
			person.friends.push({
				name: 'david'
			});

			person.$save(function (_error) {

				if (_error) {
					return _done(_error);
				}

				var newPersonMoldy = Moldy.extend('person', schema);

				newPersonMoldy.$findOne({
					id: key
				}, function (_error, newPerson) {

					newPerson.id.should.equal(key);
					newPerson.friends.splice(1, 1);

					newPerson.$save(function (_error) {
						if (_error) {
							return _done(_error);
						}

						var newNewPersonMoldy = Moldy.extend('person', schema);

						newNewPersonMoldy.$findOne({
							id: key
						}, function (_error, _newNewPersonMoldy) {
							_newNewPersonMoldy.friends.should.have.a.lengthOf(2);
							_newNewPersonMoldy.friends[1].name.should.equal('david');
							_done();
						});
					});

				});

			});

		});
	});

	it('should `update` a model', function (_done) {

		function getMoldyPerson(_pDone) {
			Moldy.extend('person', schema).$findOne({
				id: key
			}, _pDone);
		}

		async.parallel({
			// Get two Moldy references to the same thing.
			person1: getMoldyPerson,
			person2: getMoldyPerson,
		}, function (_error, _people) {
			if (_error) return _done(_error);

			async.series([
				// Update a property of each, individually.
				function (_sDone) {
					_people.person1.backpack.mainCompartment = 'precious vase';
					_people.person1.$update(_sDone);
				},
				function (_sDone) {
					_people.person2.backpack.leftPocket = 'instruction manual';
					_people.person2.$update(_sDone);
				},
			], function (_error) {
				if (_error) return _done(_error);

				// Get another reference of the moldy thing and check whether The
				// update method has updated or clobbered the data
				getMoldyPerson(function (_error, _person) {
					if (_error) return _done(_error);
					_person.backpack.mainCompartment.should.eql('precious vase');
					_person.backpack.leftPocket.should.eql('instruction manual');
					_done();
				});
			});

		});
	});

	it('should bypass moldy and do an $inc operation', function (_done) {
		var personMoldy = Moldy.extend('person', schema);

		personMoldy.$findOne({
			id: key
		}, function (_error, _person) {

			if (_error) {
				return _done(_error);
			}

			_person.age.should.eql(0);
			_person.friends[0].age.should.eql(0);

			var specialUpdate = {
				id: _person.id,
				$inc: {
					age: 1
				}
			};


			_person.$save(specialUpdate, function (_error, _updatedUser) {

				if (_error) {
					return _done(_error);
				}

				_updatedUser.age.should.eql(1);
				_person.age.should.eql(1);

				var newPersonMoldy = Moldy.extend('person', schema);

				newPersonMoldy.$findOne({
					id: key
				}, function (_error, newPerson) {

					newPerson.id.should.equal(key);
					newPerson.age.should.eql(1);

					_done(_error);
				});

			});

		});
	});

	it('should bypass moldy and do an upsert', function (_done) {
		var ObjectID = require('mongodb').ObjectID;

		var personMoldy = Moldy.extend('person', schema);

		var specialPerson = personMoldy.create({
			id: '000000000000000000001337',
			name: 'Mr Upsert'
		});
		var specialUpdate = specialPerson.$json();
		specialUpdate._id = new ObjectID('000000000000000000001337');

		specialPerson.$save(specialUpdate, function (_error, _updatedUser) {
			if (_error) {
				return _done(_error);
			}

			specialPerson.id.should.eql('000000000000000000001337');
			_updatedUser.id.should.eql('000000000000000000001337');
			specialPerson.name.should.eql('Mr Upsert');
			_updatedUser.name.should.eql('Mr Upsert');

			personMoldy.$findOne({
				name: 'Mr Upsert'
			}, function (_error, newPerson) {

				newPerson.id.should.equal('000000000000000000001337');
				newPerson.name.should.eql('Mr Upsert');

				_done(_error);
			});

		});
	});

});
