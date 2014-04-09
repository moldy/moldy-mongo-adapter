# TOC
   - [moldy-mongo-adapter](#moldy-mongo-adapter)
     - [create](#moldy-mongo-adapter-create)
     - [get](#moldy-mongo-adapter-get)
     - [collection](#moldy-mongo-adapter-collection)
     - [save](#moldy-mongo-adapter-save)
     - [destroy](#moldy-mongo-adapter-destroy)
<a name=""></a>
 
<a name="moldy-mongo-adapter"></a>
# moldy-mongo-adapter
Tell `Moldy` to use the `file` adapter.

```js
// Moldy.use( require('moldy-mongo-adapter') );
```

<a name="moldy-mongo-adapter-create"></a>
## create
should `create` by a property.

```js
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
```

<a name="moldy-mongo-adapter-get"></a>
## get
define a JSON schema.

```js
schema = {
	properties: {
		name: 'string'
	}
};
```

should create a new person so we can `get` it next.

```js
var personMoldy = new Moldy('person', schema);
personMoldy.name = 'Mr Glen';
personMoldy.$save(function (_error) {
	newPersonId = personMoldy.id;
	_done(_error);
});
```

should `get` by a `id` from the previous example.

```js
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
```

<a name="moldy-mongo-adapter-collection"></a>
## collection
should `get` a `collection`.

```js
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
```

<a name="moldy-mongo-adapter-save"></a>
## save
should `save` a model.

```js
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
	personMoldy.name = 'Mr Glen';
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
var personMoldy = new Moldy('person', schema);
personMoldy.$collection(function (_error, _guys) {
	_guys.length.should.be.greaterThan(0);
	var deleteGuy = function (_guy) {
		personMoldy.$collection(function (_error, _guys) {
			if (_guys.length === 0) {
				return _done();
			}
			var guy = new Moldy('person', schema);
			guy.$get({
				id: _guys[0].id
			}, function (_error) {
				if (_error) {
					return _done(_error);
				}
				guy.$destroy(function (_error) {
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

