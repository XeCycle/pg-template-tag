import "es6-shim";

class SqlLiteralBase {
  constructor(parts, values) {
    this._parts = parts;
    this._values = values;
  }
}

function reduceSkipOne(fn, init, array) {
  var acc = init;
  for (var i=1; i<array.length; ++i)
    acc = fn(acc, array[i], i, array);
  return acc;
}

// left fold; calls fn(prev, part/value, indexInCurrentLiteral, currentLiteralObject)

// and an extra param on parts: fn(prev, part, iPart, litObj, contiguous)
// bool contiguous is true if there is no value before this part
function flatReduceParts(fn, init, literalObject) {
  var {_parts, _values} = literalObject;

  // tagged template string must have at least one text part
  var first = fn(init, _parts[0], 0, literalObject, true);

  return reduceSkipOne((acc, part, iPart) => {
    var value = _values[iPart-1];
    if (value instanceof SqlLiteralBase)
      return fn(flatReduceParts(fn, acc, value), part, iPart, literalObject, true);
    return fn(acc, part, iPart, literalObject, false);
  }, first, _parts);
}

function flatReduceValues(fn, init, literalObject) {
  return literalObject._values.reduce((prev, value, index) => {
    if (value instanceof SqlLiteralBase)
      return flatReduceValues(fn, prev, value);
    return fn(prev, value, index, literalObject);
  }, init);
}

function computeTextSimple(literal) {
  return flatReduceParts(
    ([i, text], part, __iPart, __litObj, cont) => {
      if (cont)
        return [i, text + part];
      return [i+1, text + "$"+i + part];
    },
    [1, ""], literal)[1];
}

class SqlLiteral extends SqlLiteralBase {
  constructor(parts, values) {
    super(parts, values);
  }
  get text() {
    return computeTextSimple(this);
  }
  get values() {
    return flatReduceValues((prev, curr) => prev.concat([curr]), [], this);
  }
}

export default
function SQLTag(parts, ...values) {
  return new SqlLiteral(parts, values);
}

function setToIdMap(set) {
  var map = new Map();
  var i = 0;
  set.forEach(value => map.set(value, ++i));
  return map;
}

function computeTextDedup(literal, valueIdMap) {
  return flatReduceParts(
    (text, part, iPart, {_values}, cont) => {
      if (cont)
        return text + part;
      return text + "$"+valueIdMap.get(_values[iPart-1]) + part;
    },
    "", literal
  );
}

class DedupSqlLiteral extends SqlLiteralBase {
  constructor(parts, values) {
    super(parts, values);
  }

  collectValues() {
    if (this._valueSet)
      return this._valueSet;

    return this._valueSet = flatReduceValues(
      (set, value) => set.add(value),
      new Set(), this
    );
  }

  get text() {
    return computeTextDedup(this, setToIdMap(this.collectValues()));
  }

  get values() {
    return [...this.collectValues()];
  }
}

export
function SQL_dedup(parts, ...values) {
  return new DedupSqlLiteral(parts, values);
}

export
function join(array, separator) {
  separator = separator || ",";
  let parts = [""];
  for (let i = 0; i < array.length-1; i++) {
    parts.push(separator);
  }
  parts.push("");
  return new SqlLiteral(parts, array);
}
