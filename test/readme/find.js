var Moldy = require('moldy'),
		should = require('should'),
		async = require('async');


var personMoldy = Moldy.extend('person', {
	properties: {
		name: 'string',
		age: 'number'
	}
});


describe('find', function () {

	this.timeout(5000);
	this.slow(5000);

	before(function () {
		Moldy.use(require('../../src'));
		Moldy.adapters.mongodb.config.databaseName = 'moldyMongoAdapterTests';
	});
	
	
	beforeEach(function (_done) {
		async.series({
			ensureConnection: function (_next) {
				personMoldy.$find(_next);
			},
			deleteEveryone: function (_next) {
				Moldy.adapters.mongodb._db.collection('person').remove(_next);
			},
			createNewPeople: function (_next) {
				// create 30 new people
				var j = 0,
						tasks = [],
						person;
				for (var i = 0; i < 30; i++) {
					tasks.push(function (_callback) {
						person = personMoldy.create();
						person.name = 'Person ' + j;
						person.age = j;
						
						person.$save(function (err) {
							_callback(null, person.name);
						});
						
						j += 1;
					});
				}
				async.series(tasks, _next);
			}
			
		}, _done);
	});
	

	it('should get an array of models', function (_done) {
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
	
	
	it('should be sorted by orderBy', function (_done) {
		async.parallel({
			ascending: function (_next) {
				personMoldy.$find({ orderBy: 'age' }, function (_error, _people) {
					if (_error) {
						return _done(_error);
					}

					_people.should.be.an.Array;
					_people.length.should.be.equal(30);
					
					_people[9].age.should.be.greaterThan(_people[0].age);
					_people[15].age.should.be.greaterThan(_people[5].age);
					
					_next();
				});
			},
			
			descending: function (_next) {
				personMoldy.$find({ orderBy: '-age' }, function (_error, _people) {
					if (_error) {
						return _done(_error);
					}
					
					_people.should.be.an.Array;
					_people.length.should.be.greaterThan(10);
					
					_people[0].age.should.be.greaterThan(_people[9].age);
					_people[5].age.should.be.greaterThan(_people[15].age);
					
					_next();
				});
			},
			
			twoFields: function (_next) {
				personMoldy.$find({ orderBy: '-age,name' }, function (_error, _people) {
					if (_error) {
						return _done(_error);
					}
					
					_people.should.be.an.Array;
					_people.length.should.equal(30);
					
					_people[0].age.should.be.greaterThan(_people[9].age);
					_people[5].age.should.be.greaterThan(_people[15].age);
					
					_next();
				});
			}
		}, _done);
	});
	
	
	it('should allow for paged results', function (_done) {
		async.parallel({
			defaultPerPage1: function (_next) {
				personMoldy.$find({ page: 1 }, function (_error, _people) {
					if (_error) {
						return _done(_error);
					}
					
					_people.length.should.equal(20);
					_people[0].age.should.equal(0);
					
					_next();
				})
			},
			
			defaultPerPage2: function (_next) {
				personMoldy.$find({ page: 2 }, function (_error, _people) {
					if (_error) {
						return _done(_error);
					}
					
					// there are only 30 results so page 2 has 10 results
					_people.length.should.equal(10);
					_people[0].age.should.equal(20);
					
					_next();
				})
			},
			
			customPerPage: function (_next) {
				personMoldy.$find({ page: 1, perPage: 15 }, function (_error, _people) {
					if (_error) {
						return _done(_error);
					}
					
					_people.length.should == 15;
					
					_people[0].age.should == 0;
					_people[14].age.should == 14;
					
					_next();
				})
			}
		}, _done);
	});
	
	
	it('should allow for ordered paged results', function (_done) {
		personMoldy.$find({ page: 2, perPage: 10, orderBy: '-age' }, function (_error, _people) {
			if (_error) return _done(_error);
				
			_people.length.should.equal(10);
			
			_people[0].age.should.not.equal(30); // the highest age
			_people[9].age.should.not.equal(0); // the lowest age
			_people[0].age.should.be.greaterThan(_people[9].age);
			
			_done();
		});
	});
	
});