import "es6-shim";

class SqlLiteral {
  constructor(parts, values) {
    this._parts = parts;
    this._values = values;
  }
  getText(starting=1) {
    return this._parts.reduce((prev, curr, i) => {
      var child = this._values[i-1];
      var mid;
      if (child instanceof SqlLiteral) {
        mid = child.getText(starting);
        starting += child.values.length;
      }
      else mid = "$" + (starting++);
      return prev+mid+curr;
    });
  }
  get text() {
    return this.getText();
  }
  get values() {
    return this._values.reduce((prev, curr) => prev.concat(
      curr instanceof SqlLiteral ? curr.values : [curr]
    ), []);
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

class DedupSqlLiteral {
  constructor(parts, values) {
    this._parts = parts;
    this._values = values;
  }

  getText(valueIdMap) {
    return this._parts.reduce((prev, curr, i) => {
      var child = this._values[i-1];
      var mid;
      if (child instanceof DedupSqlLiteral) {
        mid = child.getText(valueIdMap);
      }
      else mid = "$" + valueIdMap.get(child);
      return prev+mid+curr;
    });
  }

  collectValues() {
    if (this._valueSet)
      return this._valueSet;

    return this._valueSet = (function flatten(values, set) {
      return values.reduce(
        (set, val) => val instanceof DedupSqlLiteral ? flatten(val._values, set) : set.add(val),
        set
      );
    })(this._values, new Set());
  }

  get text() {
    return this.getText(setToIdMap(this.collectValues()));
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
