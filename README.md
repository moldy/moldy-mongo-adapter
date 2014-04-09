post { id: undefined, make: 'Bugatti', model: 'Veyron' }
post res { make: 'Bugatti',
  model: 'Veyron',
  id: '5345669c11b6b6401d7466d7' }
post { id: undefined, name: 'Mr Glen' }
post res { name: 'Mr Glen', id: '5345669c11b6b6401d7466d8' }
get { id: '5345669c11b6b6401d7466d8' }
$get res { name: 'Mr Glen', id: '5345669c11b6b6401d7466d8' }
delete { id: '5345669c11b6b6401d7466d8', name: 'Mr Glen' }
delete res 1
get {}
$collection res [ { make: 'Bugatti',
    model: 'Veyron',
    id: '53455ff3589b58da128ac080' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '534560670508e765130eb60f' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '534560ad8375f8b813a2441e' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '534560b57742b9f3131c24c0' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '534560c21896b33514afff8a' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '534560c2e7fae35b14322f03' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '534560d5c9ab4499147818b7' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '534560d571d3c8c514731bc6' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '534560e55b2a59fe14476174' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '534560e663cd752415d6977e' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '534560eb66698d5c1575415b' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '534560ecf578868215d40905' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '53456107b431deda155eb11c' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '534561a95edc117516df14d9' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '534561ee8bb8bede16c1f320' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '5345624ee4c9a75817c2f4c8' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '534562640170f6a71773ccdc' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '53456273c03b70ef1723769b' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '534562bb7a6ed746186b6127' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '534562c669fa9e8d18645ce2' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '534562c9a98439d418f9cce3' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '534563e5021c2091195cab38' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '5345642e7ac649151acb8efb' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '534564b89fac67881a507181' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '534564d87ea999de1a8cffa3' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '5345661b504d29871b862c6b' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '5345663b0d7aacde1b2a3c35' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '5345666b7efe7e371c6ae860' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '5345668bd20f837f1c8dc25b' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '5345668cd22641b71c77805a' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '5345669c050471021da3d9b4' },
  { make: 'Bugatti',
    model: 'Veyron',
    id: '5345669c11b6b6401d7466d7' } ]
get {}
$collection res [ { name: 'Mr Glen', id: '53455ff3589b58da128ac081' },
  { name: 'Mr Glen', id: '534560ae8375f8b813a2441f' },
  { name: 'Mr Glen', id: '534560b57742b9f3131c24c1' },
  { name: 'Mr Glen', age: null, id: '53455ff3589b58da128ac081' } ]
put { id: '53455ff3589b58da128ac081', name: 'Mr Glen', age: null }
put res 1
get { id: '53455ff3589b58da128ac081' }
$get res { name: 'Mr Glen', id: '53455ff3589b58da128ac081' }
# TOC
   - [moldy-mongo-adapter](#moldy-mongo-adapter)
     - [create](#moldy-mongo-adapter-create)
     - [get](#moldy-mongo-adapter-get)
     - [collection](#moldy-mongo-adapter-collection)
     - [save](#moldy-mongo-adapter-save)
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

