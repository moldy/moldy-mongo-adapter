# TOC
   - [moldy-mongo-adapter](#moldy-mongo-adapter)
     - [create](#moldy-mongo-adapter-create)
     - [get](#moldy-mongo-adapter-get)
     - [collection](#moldy-mongo-adapter-collection)
<a name=""></a>
 
<a name="moldy-mongo-adapter"></a>
# moldy-mongo-adapter
Tell `Moldy` to use the `mongo` adapter.

```js
// Moldy.use( require('moldy-mongo-adapter') );
```

<a name="moldy-mongo-adapter-create"></a>
## create
should `create` by a property.

```js
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
```

