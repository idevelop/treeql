var treeQLVariableKey = "__treeql_variable__";

function isSimpleType(variable) {
	return ["number", "boolean", "string"].indexOf(typeof variable) > -1;
}

function isVariableNode(node) {
	return (typeof node === "object") && node.hasOwnProperty(treeQLVariableKey);
}

function treeMatch(tree, query, variables) {
	if (query === undefined) {
		return true;
	}

	if (typeof query === "function") {
		try {
			return query(tree);
		} catch(e) {
			return false;
		}
	}

	if (isVariableNode(query)) {
		var variableName = query[treeQLVariableKey];
		if (variables.hasOwnProperty(variableName)) {
			return treeMatch(tree, variables[variableName], variables);
		} else {
			variables[variableName] = tree;
			return true;
		}
	}

	if (typeof query !== typeof tree) {
		return false;
	}

	if (Array.isArray(query) !== Array.isArray(tree)) {
		return false;
	}

	if (isSimpleType(query)) {
		return tree === query;
	}

	if (query === null || tree === null) {
		return tree === query;
	}

	if (Array.isArray(query)) {
		// Comparing two arrays, each element in the query array must match at least one element in the tree array
		for (var i = 0; i < query.length; i++) {
			var foundMatch = false;
			for (var j = 0; j < tree.length; j++) {
				if (treeMatch(tree[j], query[i], variables)) {
					foundMatch = true;
					break;
				}
			}

			if (!foundMatch) {
				return false;
			}
		}
	} else {
		// Comparing two objects, all query keys should be included in object keys
		for (var key in query) {
			if (!tree.hasOwnProperty(key)) {
				return false;
			} else {
				if (!treeMatch(tree[key], query[key], variables)) {
					return false;
				}
			}
		}
	}

	return true;
}

function findMatches(tree, query, callback) {
	var matches = 0;

	if (typeof tree === "object")
		for (var key in tree) {
			if (tree.hasOwnProperty(key)) {
				var result = findMatches(tree[key], query, callback);
				matches += result.matches;
				tree[key] = result.tree;
			}
		}

	var variables = {};
	if (treeMatch(tree, query, variables)) {
		matches++;

		var replacement = callback(tree, variables);
		if (replacement !== undefined) {
			return {
				matches: matches,
				tree: replacement
			};
		}
	}

	return {
		matches: matches,
		tree: tree
	};
}

exports.query = function(tree, query, nodeCallback, completeCallback) {
	nodeCallback = nodeCallback || function(){};
	completeCallback = completeCallback || function(){};

	var treeCopy = JSON.parse(JSON.stringify(tree));

	var result = findMatches(treeCopy, query, nodeCallback);

	completeCallback(result.tree, result.matches);
};

exports.variable = function(name) {
	var node = {};
	node[treeQLVariableKey] = name;
	return node;
};
