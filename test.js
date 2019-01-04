"use strict";
const {after, before, beforeEach, describe, it} = require("mocha");
const customizeSymbol = require("incomplete-symbol");
const customizeURL = require("incomplete-url");
const decache = require("decache");
const {expect} = require("chai");
const {lenientProperties, strictProperties} = require("./lib/props");
const {parse: parseURL, URLSearchParams: NativeURLSearchParams} = require("url");
const {URLSearchParams: ShimmedURLSearchParams} = require("whatwg-url");

const allProperties = [...lenientProperties, ...strictProperties];
const paramsString = "param=value";
let isURLSearchParams;



const createMock = (config={}) =>
{
	const mock = allProperties.reduce((result, prop) =>
	{
		result[prop] = () => {};
		return result;
	}, {});

	const {skipKey, toStringTag} = config;

	if (typeof skipKey==="string" && skipKey!=="")
	{
		delete mock[skipKey];
	}

	if (toStringTag === true)
	{
		mock[Symbol.toStringTag] = "URLSearchParams";
	}

	return mock;
};



const requireFreshLibs = () =>
{
	decache("has-to-string-tag-x");
	decache("./lib");
	isURLSearchParams = require("./lib");
};



before(() => requireFreshLibs());



it("accepts a native full implemention", () =>
{
	const searchParams = new NativeURLSearchParams(paramsString);

	expect( isURLSearchParams(searchParams) ).to.be.true;
	expect( isURLSearchParams.lenient(searchParams) ).to.be.true;
});



it("accepts a shimmed full implemention", () =>
{
	const searchParams = new ShimmedURLSearchParams(paramsString);

	expect( isURLSearchParams(searchParams) ).to.be.true;
	expect( isURLSearchParams.lenient(searchParams) ).to.be.true;
});



it("can accept a partial implemention", () =>
{
	const {IncompleteURLSearchParams} = customizeURL({ paramsExclusions:["sort"] });
	const searchParams = new IncompleteURLSearchParams(paramsString);

	expect( isURLSearchParams(searchParams) ).to.be.false;
	expect( isURLSearchParams.lenient(searchParams) ).to.be.true;
});



it("rejects non-URLSearchParams types", () =>
{
	const fixtures =
	[
		paramsString,
		createMock(),
		parseURL(paramsString, true).query,
		Symbol(paramsString),
		{},
		[],
		/regex/,
		true,
		1,
		null,
		undefined
	];

	fixtures.forEach(fixture =>
	{
		expect( isURLSearchParams(fixture) ).to.be.false;
		expect( isURLSearchParams.lenient(fixture) ).to.be.false;
	});
});



allProperties.forEach(key =>
{
	it(`rejects a mocked implementation lacking the "${key}" property`, () =>
	{
		const mock = createMock({ skipKey:key, toStringTag:true });

		expect( isURLSearchParams(mock) ).to.be.false;

		if (lenientProperties.includes(key))
		{
			expect( isURLSearchParams.lenient(mock) ).to.be.true;
		}
		else
		{
			expect( isURLSearchParams.lenient(mock) ).to.be.false;
		}
	});
});



describe("Environments lacking @@toStringTag", () =>
{
	const OriginalSymbol = Symbol;



	beforeEach(() =>
	{
		global.Symbol = customizeSymbol(["toStringTag"]);
		requireFreshLibs();
	});



	after(() =>
	{
		global.Symbol = OriginalSymbol;
		requireFreshLibs();
	});



	it("accepts a mocked full implementation with incorrect constructor name", () =>
	{
		const mock = createMock();

		expect( isURLSearchParams(mock) ).to.be.true;
		expect( isURLSearchParams.lenient(mock) ).to.be.true;
	});
});



describe("Weaknesses", () =>
{
	it("accepts a mocked full implementation that uses @@toStringTag", () =>
	{
		const mock = createMock({ toStringTag:true });

		expect( isURLSearchParams(mock) ).to.be.true;
	});



	it("can leniently accept a mocked partial implementation that uses @@toStringTag", () =>
	{
		const mock = createMock({ skipKey:"searchParams", toStringTag:true });

		expect( isURLSearchParams.lenient(mock) ).to.be.true;
	});
});
