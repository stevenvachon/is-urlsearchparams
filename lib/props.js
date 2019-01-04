"use strict";

const lenientProperties =
[
	"entries",
	"sort",
	"values"
];

const strictProperties =
[
	"append",
	"delete",
	"get",
	"getAll",
	"has",
	"keys",
	"set",
	// "toString" excluded because Object::toString exists
];



module.exports = { lenientProperties, strictProperties };
