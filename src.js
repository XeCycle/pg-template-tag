class SqlLiteral {
  constructor(parts, values) {
    this._parts = parts;
    this._values = values;
  }

  _resolveText(starting, descendants) {
    if (!descendants.has(this)) {
      const text = this._parts.reduce((prev, curr, i) => {
        var child = this._values[i-1];
        var mid;
        if (child instanceof SqlLiteral) {
          starting = child._resolveText(starting, descendants);
          mid = descendants.get(child);
        }
        else mid = "$" + (starting++);
        return prev+mid+curr;
      });
      descendants.set(this, text);
    }
    return starting;
  }

  _resolveValues(descendants, values) {
    if (!descendants.has(this)) {
      for (const child of this._values) {
        if (child instanceof SqlLiteral) {
          child._resolveValues(descendants, values);
        } else {
          values.push(child);
        }
      }
      descendants.add(this);
    }
  }

  get text() {
    const descendants = new Map();
    this._resolveText(1, descendants);
    return descendants.get(this);
  }

  get values() {
    const descendants = new Set();
    const values = [];
    this._resolveValues(descendants, values);
    return values;
  }
}

export default
function SQLTag(parts, ...values) {
  return new SqlLiteral(parts, values);
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
