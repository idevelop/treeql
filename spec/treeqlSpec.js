var treeql = require("../treeql");
var $ = treeql.variable;

describe("selecting", function() {
  it("should match root", function() {
    var tree = {
      "name": "Andrei",
      "age": 28
    };

    var query = {
      "name": "Andrei"
    };

    treeql.query(tree, query, function(node) {
      expect(node.age).toEqual(28);
    }, function(resultTree, matchesCount) {
      expect(matchesCount).toEqual(1);
    });
  });

  it("should match simple type", function() {
    treeql.query("Andrei", "Andrei", null, function(resultTree, matchesCount) {
      expect(resultTree).toEqual("Andrei");
      expect(matchesCount).toEqual(1);
    });
  });

  it("should not match array with object", function() {
    var tree = {
      name: "Andrei"
    };

    var query = [];

    treeql.query(tree, query, null, function(resultTree, matchesCount) {
      expect(matchesCount).toEqual(0);
    });
  });

  it("should match undefined value", function() {
    var data = [{
      name: "Andrei"
    }, {
      differentProperty: 10
    }];

    // Match objects with "name" property
    var query = {
      name: undefined
    };

    treeql.query(data, query, null, function(resultTree, matchesCount) {
      expect(matchesCount).toEqual(1);
    });
  });

  it("should find objects based on function", function() {
    var data = [{
      name: "Andrei",
      age: 28
    }, {
      name: "Corina",
      age: 26
    }, {
      name: "Homer Simpson",
      age: 60
    }];

    treeql.query(data, {
      age: function(age) { return age < 50; }
    }, null, function(resultTree, matchesCount) {
      expect(matchesCount).toEqual(2);
    });
  });

  it("should match partial array definition with index > 0", function() {
    var data = {
      properties: [{
        type: 'a',
        value: 4
      }, {
        type: 'b',
        value: 5
      }]
    };

    treeql.query(data, {
      properties: [{
        value: function(v) { return v == 5; }
      }]
    }, null, function(result, count) {
      expect(count).toEqual(1);
    });
  });

  it("should find simple object", function() {
    var tree = {
      person: {
        "name": "Andrei",
        "age": 28
      }
    };

    var query = {
      "name": "Andrei"
    };

    treeql.query(tree, query, function(node) {
      expect(node.age).toEqual(28);
    }, function(resultTree, matchesCount) {
      expect(matchesCount).toEqual(1);
    });
  });

  it("should find variables that appear once", function() {
    var tree = {
      person: {
        "name": "Andrei",
        "age": 28,
        "city": "London"
      }
    };

    var query = {
      "name": "Andrei",
      "age": $("age"),
      "city": $("city")
    };

    treeql.query(tree, query, function(node, variables) {
      expect(node.age).toEqual(28);
      expect(variables.age).toEqual(28);
      expect(variables.city).toEqual("London");
    }, function(resultTree, matchesCount) {
      expect(matchesCount).toEqual(1);
    });
  });

  it("should find identical variables that appear multiple times", function() {
    var tree = {
      person: {
        "name": "Andrei",
        "age": 28,
        "os": "MacOS",
        "team": {
          "name": "idevelop",
          "favorite_os": "MacOS"
        }
      }
    };

    var query = {
      "os": $("operating_system"),
      "team": {
        "favorite_os": $("operating_system")
      }
    };

    treeql.query(tree, query, function(node, variables) {
      expect(node.name).toEqual("Andrei");
      expect(variables.operating_system).toEqual("MacOS");
    }, function(resultTree, matchesCount) {
      expect(matchesCount).toEqual(1);
    });
  });

  it("should fail to match same variable with different values", function() {
    var tree = {
      person: {
        "name": "Andrei",
        "age": 28,
        "os": "MacOS",
        "team": {
          "name": "idevelop",
          "favorite_os": "Windows"
        }
      }
    };

    var query = {
      "os": $("operating_system"),
      "team": {
        "favorite_os": $("operating_system")
      }
    };

    treeql.query(tree, query, null, function(resultTree, matchesCount) {
      expect(matchesCount).toEqual(0);
    });
  });
});

describe("replacing", function() {
  it("should update a node value", function() {
    var tree = [{
      name: "Andrei",
      age: 28
    }, {
      name: "Corina",
      age: 26
    }];

    treeql.query(tree, {
      "name": "Andrei"
    }, function(node) {
      node.age++;
    }, function(resultTree, matchesCount) {
      expect(resultTree.length).toEqual(2);

      treeql.query(resultTree, {
        "name": "Andrei"
      }, function(node) {
        expect(node.age).toEqual(29);
      });
    });
  });

  it("should replace simple value", function() {
    treeql.query({
      name: "Andrei"
    }, "Andrei", function() {
      return "Homer";
    }, function(result) {
      expect(result.name).toEqual("Homer");
    });
  });

  it("should replace simple node", function() {
    var tree = [{
      name: "Andrei",
      age: 28
    }, {
      name: "Corina",
      age: 26
    }];

    treeql.query(tree, {
      "name": "Andrei"
    }, function(node) {
      return {
        name: "Andrei Gheorghe",
        age: 28.5
      };
    }, function(resultTree, matchesCount) {
      expect(resultTree.length).toEqual(2);

      treeql.query(resultTree, {
        "name": "Andrei Gheorghe"
      }, null, function(resultTree, matchesCount) {
        expect(matchesCount).toEqual(1);
      });
    });
  });

  it("should recursively sum up a tree of numbers", function() {
    var tree = [1, 2, 3, [4, 5, [6]]];
    var query = [];

    treeql.query(tree, query, function(node) {
      var sum = node.reduce(function(value, total) {
        return value + total;
      }, 0);

      return sum;
    }, function(resultTree, matchesCount) {
      expect(resultTree).toEqual(21);
    });
  });
});
