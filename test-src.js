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
});
