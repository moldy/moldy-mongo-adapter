# TOC
   - [moldy-mongo-adapter](#moldy-mongo-adapter)
     - [create](#moldy-mongo-adapter-create)
     - [get](#moldy-mongo-adapter-get)
     - [find](#moldy-mongo-adapter-find)
     - [save](#moldy-mongo-adapter-save)
     - [destroy](#moldy-mongo-adapter-destroy)
<a name=""></a>
 
<a name="moldy-mongo-adapter"></a>
# moldy-mongo-adapter
<a name="moldy-mongo-adapter-create"></a>
## create
should `create` by a property.

```js
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
```

<a name="moldy-mongo-adapter-get"></a>
## get
define a JSON schema.

```js
schema = {
	properties: {
		name: 'string',
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
```

should create a new person so we can `get` it next.

```js
var personMoldy = Moldy.extend('person', schema).create();
personMoldy.name = 'Mr David';
personMoldy.friends.push({
	name: 'leonie'
});
personMoldy.friends[0].age = ' 33';
personMoldy.friends.push({
	name: 'max'
});
personMoldy.$save(function (_error) {
	newPersonId = personMoldy.id;
	_done(_error);
});
```

should handle not found items.

```js
var personMoldy = Moldy.extend('person', schema);
personMoldy.$findOne({
	id: 'non-existant id'
}, function (_error, _item) {
	should.not.exist(_error);
	should(_item).eql(undefined);
	_done();
});
```

should `get` by a `id` from the previous example.

```js
var personMoldy = Moldy.extend('person', schema);
personMoldy.$findOne({
	id: newPersonId
}, function (_error, _david) {
	if (_error) {
		return _done(_error);
	}
	var david = _david;
	david.name.should.eql('Mr David');
	david.friends.should.be.an.Array;
	david.friends.should.have.a.lengthOf(2);
	david.friends[0].name.should.equal('leonie');
	david.friends[0].age.should.equal(33);
	david.friends[1].name.should.equal('max');
	david.friends[1].age.should.equal(0);
	david.$destroy(_done);
});
```

<a name="moldy-mongo-adapter-find"></a>
## find
should get an array of models.

```js
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
```

should be sorted by orderBy.

```js
async.parallel({
	ascending: function (_next) {
		personMoldy.$find({
			__orderBy: 'age'
		}, function (_error, _people) {
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
		personMoldy.$find({
			__orderBy: '-age'
		}, function (_error, _people) {
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
		personMoldy.$find({
			__orderBy: '-age,name'
		}, function (_error, _people) {
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
```

should allow for paged results.

```js
async.parallel({
	defaultPerPage1: function (_next) {
		personMoldy.$find({
			__page: 1
		}, function (_error, _people) {
			if (_error) {
				return _done(_error);
			}
			_people.length.should.equal(20);
			_people[0].age.should.equal(0);
			_next();
		});
	},
	defaultPerPage2: function (_next) {
		personMoldy.$find({
			__page: 2
		}, function (_error, _people) {
			if (_error) {
				return _done(_error);
			}
			// there are only 30 results so page 2 has 10 results
			_people.length.should.equal(10);
			_people[0].age.should.equal(20);
			_next();
		});
	},
	customPerPage: function (_next) {
		personMoldy.$find({
			__page: 1,
			__perPage: 15
		}, function (_error, _people) {
			if (_error) {
				return _done(_error);
			}
			_people.length.should === 15;
			_people[0].age.should === 0;
			_people[14].age.should === 14;
			_next();
		});
	}
}, _done);
```

should allow for ordered paged results.

```js
personMoldy.$find({
	__page: 2,
	__perPage: 10,
	__orderBy: '-age'
}, function (_error, _people) {
	if (_error) {
		return _done(_error);
	}
	_people.length.should.equal(10);
	_people[0].age.should.not.equal(30); // the highest age
	_people[9].age.should.not.equal(0); // the lowest age
	_people[0].age.should.be.greaterThan(_people[9].age);
	_done();
});
```

<a name="moldy-mongo-adapter-save"></a>
## save
create a schema.

```js
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
```

should `save` a model.

```js
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
```

should `update` a model.

```js
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
```

should bypass moldy and do an $inc operation.

```js
var personMoldy = Moldy.extend('person', schema);
personMoldy.$findOne({
	id: key
}, function (_error, _person) {
	if (_error) {
		return _done(_error);
	}
	_person.age.should.eql(0);
	_person.friends[0].age.should.eql(0);
	specialUpdate = {
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
```

<a name="moldy-mongo-adapter-destroy"></a>
## destroy
define a JSON schema.

```js
schema = {
	properties: {
		name: 'string'
	}
};
```

should `destroy` all the models.

```js
var personMoldy = Moldy.extend('person', schema);
personMoldy.$find(function (_error, _guys) {
	_guys.length.should.be.greaterThan(0);
	var deleteGuy = function (_guy) {
		personMoldy.$find(function (_error, _guys) {
			if (_guys.length === 0) {
				return _done();
			}
			var guy = Moldy.extend('person', schema);
			guy.$findOne({
				id: _guys[0].id
			}, function (_error, _guy) {
				if (_error) {
					return _done(_error);
				}
				_guy.$destroy(function (_error) {
					if (_error) {
						return _done(_error);
					}
					deleteGuy();
				});
			});
		});
	};
	deleteGuy();
});
```

