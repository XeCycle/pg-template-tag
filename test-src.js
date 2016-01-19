import {default as SQL, SQL_dedup as _SQL, join} from "./";
import assert from "assert";

describe("pg-template-tag", function() {

  describe("default export (SQL)", function() {

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

  });

  describe("SQL_dedup", function() {

    it("collects values and write placeholders", function() {
      var literal = _SQL`foo ${123} ${"abc"} bar ${null}`;
      assert.equal(literal.text, "foo $1 $2 bar $3");
      assert.deepEqual(literal.values, [123, "abc", null]);
    });

    it("accepts nested literals", function() {
      var literal = _SQL`foo ${_SQL`bar ${1} ${2} ${_SQL`baz`}`} ${_SQL`foobar ${3}`} ${4}`;
      assert.equal(literal.text, "foo bar $1 $2 baz foobar $3 $4");
      assert.deepEqual(literal.values, [1, 2, 3, 4]);
    });

    it("dedup values", function() {
      var literal = _SQL`foo ${1} bar ${2} baz ${1} nested ${_SQL`foobar ${2}`}`;
      assert.equal(literal.text, "foo $1 bar $2 baz $1 nested foobar $2");
      assert.deepEqual(literal.values, [1, 2]);
    });

  });

  describe("interoperation", function() {

    it("decides policy by top-level tag function", function() {
      var partA = SQL`${1}`;
      var partB = _SQL`${1}`;

      var nonReusing = SQL`A ${partA} B ${partB}`;
      assert.equal(nonReusing.text, "A $1 B $2");
      assert.deepEqual(nonReusing.values, [1, 1]);

      var reusing = _SQL`A ${partA} B ${partB}`;
      assert.equal(reusing.text, "A $1 B $1");
      assert.deepEqual(reusing.values, [1]);
    });

  });

  describe("join", function() {

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

  });

});
