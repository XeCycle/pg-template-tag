import {default as SQL, join, split} from "./";
import assert from "assert";

describe("pg-template-tag", function() {
  it("collects values and write placeholders", function() {
    var literal = SQL`foo ${123} ${"abc"} bar ${null}`;
    assert.equal(literal.text, "foo $1 $2 bar $3");
    assert.deepEqual(literal.values, [123, "abc", null]);
  });

  it("accepts nested literals", function() {
    var literal = SQL`foo ${SQL`bar ${1} ${2} ${SQL`baz`}`} ${SQL`foobar ${3}`} ${4}`;
    assert.equal(literal.text, "foo bar $1 $2 baz foobar $3 $4");
    assert.deepEqual(literal.values, [1, 2, 3, 4]);
  });

  it("does not interpolate arrays into values array", function() {
    var literal = SQL`${[1, 2, 3]}`;
    assert.deepEqual(literal.values, [[1, 2, 3]]);
  });

  it("joins SQL instances", function () {
    var literal = join([SQL`foo`, SQL`bar ${123}`, SQL`${456}`], " sep ");
    assert.equal(literal.text, "foo sep bar $1 sep $2");
    assert.deepEqual(literal.values, [123, 456]);
  });

  it("joins with default comma", function () {
    var literal = join([SQL`foo`, SQL`bar`]);
    assert.equal(literal.text, "foo,bar");
  });

  it("joins other types", function () {
    var literal = join([1, 'hello', [1, 2, 3]]);
    assert.equal(literal.text, "$1,$2,$3");
    assert.deepEqual(literal.values, [1, 'hello', [1, 2, 3]]);
  });

  it("concat concatenates literals", function () {
    var literal = SQL`foo ${123}`.concat(SQL` ${"abc"} bar ${null}`);
    assert.equal(literal.text, "foo $1 $2 bar $3");
    assert.deepEqual(literal.values, [123, "abc", null]);
  });

  it("splits on undefined pattern", function () {
    var splitted = SQL`foo ${1} bar`.split();
    assert.strictEqual(splitted.length, 1);
    assert.equal(splitted[0].text, "foo $1 bar");
    assert.deepEqual(splitted[0].values, [1]);
  });

  it("splits on a character", function () {
    var splitted = SQL`foo ${1}; bar ${2} ${3}; baz; foo;bar;${4}`.split(";");
    assert.strictEqual(splitted.length, 6);
    assert.equal(splitted[0].text, "foo $1");
    assert.deepEqual(splitted[0].values, [1]);
    assert.equal(splitted[1].text, " bar $1 $2");
    assert.deepEqual(splitted[1].values, [2, 3]);
    assert.equal(splitted[2].text, " baz");
    assert.deepEqual(splitted[2].values, []);
    assert.equal(splitted[3].text, " foo");
    assert.deepEqual(splitted[3].values, []);
    assert.equal(splitted[4].text, "bar");
    assert.deepEqual(splitted[4].values, []);
    assert.equal(splitted[5].text, "$1");
    assert.deepEqual(splitted[5].values, [4]);
  });

  it("splits on a pattern", function () {
    var splitted = SQL`foo AND ${"bar"} and baz`.split(/ and /i);
    assert.strictEqual(splitted.length, 3);
    assert.equal(splitted[0].text, "foo");
    assert.deepEqual(splitted[0].values, []);
    assert.equal(splitted[1].text, "$1");
    assert.deepEqual(splitted[1].values, ["bar"]);
    assert.equal(splitted[2].text, "baz");
    assert.deepEqual(splitted[2].values, []);
  });

  it("split preserves original", function () {
    var literal = SQL`foo ${1} bar ${2} baz`
    var splitted = literal.split(" ");
    assert.strictEqual(literal.text, "foo $1 bar $2 baz");
    assert.deepEqual(literal.values, [1, 2]);
  });

  it("splits nested literals", function () {
    var splitted = SQL`foo;${SQL`bar;baz`};bar`.split(";");
    assert.strictEqual(splitted.length, 4);
    assert.equal(splitted[0].text, "foo");
    assert.deepEqual(splitted[0].values, []);
    assert.equal(splitted[1].text, "bar");
    assert.deepEqual(splitted[1].values, []);
    assert.equal(splitted[2].text, "baz");
    assert.deepEqual(splitted[2].values, []);
    assert.equal(splitted[3].text, "bar");
    assert.deepEqual(splitted[3].values, []);
  });
});
