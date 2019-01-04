"use strict";
const hasToStringTag = require("has-to-string-tag-x");
const isObject = require("is-object");
const {lenientProperties, strictProperties} = require("./props");

const searchParamsClass = "[object URLSearchParams]";
const toStringTag = Object.prototype.toString;



const isURLSearchParams = (searchParams, supportIncomplete=false) =>
{
	if (!isObject(searchParams))
	{
		return false;
	}
	else if (hasToStringTag && toStringTag.call(searchParams)!==searchParamsClass)
	{
		// Shimmed implementation with incorrect constructor name
		return false;
	}
	else if (!strictProperties.every(prop => prop in searchParams))
	{
		return false;
	}
	else if (supportIncomplete)
	{
		return true;
	}
	else
	{
		return lenientProperties.every(prop => prop in searchParams);
	}
};



isURLSearchParams.lenient = searchParams => isURLSearchParams(searchParams, true);



module.exports = isURLSearchParams;
