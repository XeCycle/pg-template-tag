import SQL from "./";
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
    var literal = SQL.join([SQL`foo`, SQL`bar ${123}`, SQL`${456}`], " sep ");
    assert.equal(literal.text, "foo sep bar $1 sep $2");
    assert.deepEqual(literal.values, [123, 456]);
  });

  it("joins with default comma", function () {
    var literal = SQL.join([SQL`foo`, SQL`bar`]);
    assert.equal(literal.text, "foo,bar");
  });

  it("joins other types", function () {
    var literal = SQL.join([1, 'hello', [1, 2, 3]]);
    assert.equal(literal.text, "$1,$2,$3");
    assert.deepEqual(literal.values, [1, 'hello', [1, 2, 3]]);
  });
});
