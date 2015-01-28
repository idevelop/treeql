TreeQL
======

JSON query and mutation library. It traverses a tree structure in post-order (leaves first, root last), across objects and arrays, returning the nodes which match the partial structure passed in the query, as well as allowing you to mutate or replace matched nodes.

## Usage

```
npm install treeql
```

```javascript
var treeql = require("treeql");

treeql.query(tree, query, function(node, variables) {
  // this will be called for every node matching the query
  // return replacement node [optional]
}, function(resultTree, matchesCount) {
  // resultTree: the tree obtained after applying mutations
  // matchesCount: the number of nodes that matched the query
});
```

## Examples

### Simple node selection

```javascript
var data = {
  people: [{
    name: "Andrei",
    age: 28
  }, {
    name: "Homer Simpson",
    age: 60
  }, {
    name: "Corina",
    age: 28
  }]
}

// Query for people aged 28
treeql.query(data, {
  age: 28
}, function(node) {
  // this callback will be called twice:
  // 1: node = { name: "Andrei", age: 28 }
  // 2: node = { name: "Corina", age: 28 }
});
```

### Dynamic filter

Instead of static values, you can use a function to filter based on more complex conditions.

```javascript
var data = {
  people: [{
    name: "Andrei",
    age: 28
  }, {
    name: "Homer Simpson",
    age: 60
  }, {
    name: "Corina",
    age: 28
  }]
}

// Query for people aged under 50
treeql.query(data, {
  age: function(age) { return age < 50 }
}, function(node) {
  // this callback will be called twice:
  // 1: node = { name: "Andrei", age: 28 }
  // 2: node = { name: "Corina", age: 28 }
});
```

### Variables

The library supports variable definition in the query to ensure it matches the same value across different parts of the `query` object.

```javascript
var $ = treeql.variable;

var tree = {
  person: {
    "name": "Andrei",
    "age": 28,
    "os": "MacOS",
    "team": {
      "name": "idevelop",
      "preferred_os": "MacOS"
    }
  }
};

// Query for people using their team's preferred OS
var query = {
  "os": $("operating_system"),
  "team": {
    "preferred_os": $("operating_system")
  }
};

treeql.query(tree, query, function(node, variables) {
  // node = { "name": "Andrei", ... }
  // variables = { "operating_system": "MacOS" }
});
```

### Tree mutation

TreeQL also supports mutating the set of matched nodes. Any mutation happens on a copy of the original structure, which remains unchanged. To obtain the resulting mutated tree, the `query` function takes on optional second callback parameter, `completeCallback`, which gets invoked at the end and receives the arguments `resultTree` and `matchesCount`.

To mutate the tree you can either change properties of a matched node inside the node callback:

```javascript
treeql.query(tree, {
  "name": "Andrei"
}, function(node) {
  node.age++;
}, function(resultTree, matchesCount) {
  // resultTree contains the original tree, with all the age values incremented
});
```

Alternatively, if the node callback returns a value, it will replace the matched node entirely.

```javascript
var data = [{
  name: "Andrei"
}, {
  differentProperty: 10
}]

// Match objects with "name" property, regardless of value
var query = {
  name: undefined
};

treeql.query(data, query, function(node) {
  return {
    name: node.name.toLowerCase()
  }
});
```

Here's how you can sum up a nested tree of number arrays.

```javascript
var data = [1, 2, 3, [4, 5, [6]]];

var query = []; // Match any array

treeql.query(data, query, function(array) {
  var sum = 0;
  array.map(function(value) {
    sum += value;
  });

  return sum;
}, function(result) {
  // result = 21
});
```

You can find a couple more examples in the `treeSpec.js` unit test suite.

## Author

**Andrei Gheorghe**

* [About me](http://idevelop.github.com)
* LinkedIn: [linkedin.com/in/idevelop](http://www.linkedin.com/in/idevelop)
* Twitter: [@idevelop](http://twitter.com/idevelop)

## License

- TreeQL is licensed under the MIT License.
- I am providing code in this repository to you under an open source license. Because this is my personal repository, the license you receive to my code is from me and not from my employer (Facebook).
