# qix-faker

> Powered by [faker.js](https://github.com/Marak/faker.js)

Generate fake Qlik Engine data in the shape of [hypercubes](https://core.qlik.com/services/qix-engine/apis/qix/definitions/#hypercube) and [listobjects](https://core.qlik.com/services/qix-engine/apis/qix/definitions/#listobject).

Great for prototyping with [picasso.js](https://picassojs.com), [nebula.js](https://github.com/qlik-oss/nebula.js) and any other time when a real Qlik Engine is not available.

- [Try it out here](https://codesandbox.io/s/qf-d72kk)
- [mekko chart example with nebula.js, no Qlik engine](https://codesandbox.io/s/friendly-framework-wf4yn)


## Usage

### node.js

```sh
npm install qix-faker
```

```js
const { hypercube, listobject } = require('qix-faker');

const hc = hypercube({
  dimensions: [f => f.commerce.product()],
  measures: [f => f.commerce.price(100, 5000, 2, '$')],
  numRows: 3,
});

const lo = listobject({
  dimension: [f => f.commerce.product()],
  numRows: 5,
});
```

## API

### qixFaker.hypercube(options)

- options `<object>`
  - dimensions `<Array<field>>` - Dimensions.
  - measures `<Array<field>>` - Measures.
  - numRows `<number>` - Number of rows to generate.
  - seed `<number>` - Set the same number to generate consistent results.

```js
qixFaker.hypercube({
  numRows: 10,
  seed: 5,
  dimensions: [
    {
      value: (faker, rowIdx) => faker.date.month(),
    },
  ],
});
```

### qixFaker.listobject(options)

- options `<object>`
  - dimension `<field>`.
  - numRows `<number>` - Number of rows to generate.
  - seed `<number>` - Set the same number to generate consistent results.

```js
qixFaker.listobject({
  numRows: 10,
  seed: 5678,
  dimension: f => d.name.firstName(),
});
```

### types

#### field `<function | object>`

A `field` configuration can take on two different shapes:

##### `<function(faker, rowIndex)>`

A function which is provided the `faker` instance as first parameter, and the `rowIndex` as the second. See the [faker api](http://marak.github.io/faker.js/faker.html) for details on params of each method.

```js
hypercube({
  dimensions: [(faker, idx) => faker.commerce.product()],
  measures: [(faker, idx) => faker.finance.amount(100, 3000, 2, '$')],
});
```

##### `<object>`

Using an object provides more control:

- value: `<function(faker, rowIndex)>` - Same function as above.
- maxCardinalRatio `<number>` - A value between `0 - 1` to limit the uniqueness of dimension values.
- attrDims `<Array<field>>` - Attribute dimensions.
- attrExps `<Array<field>` - Attribute expression.
- override `<object>` - Set custom properties on the field.

```js
hypercube({
  numRows: 100,
  dimensions: [
    {
      value: f => f.address.city(),
      maxCardinalRatio: 0.4,
      attrDim: [f => f.commerce.color()],
      attrExps: [f => f.random.number()]
      override: {
        qFallbackTitle: 'City',
        qLocked: true,
      },
    },
  ],
});
```

In the above example, 100 rows of data is generated using the `city` dataset provided in `faker`, there is however no guarantee that all 100 rows will be unique.

In some cases though, it might be desirable to limit the uniqueness of the generated values; `maxCardinalRatio` provides a way to do just that.

Assume we want to generate some data containing _cities_ grouped by _country_, by setting `maxCardinalRatio` to a low number we can create such a dataset.

```js
hypercube({
  numRows: 80,
  dimensions: [
    {
      value: f => f.address.country(),
      maxCardinalRatio: 0.1,
    },
    {
      value: f => f.address.city(),
    },
  ],
});
```

In the above example, the first 8 rows (numRows \* ratio) of _country_ will be the same, while _city_ will be randomized, thus creating groups.
