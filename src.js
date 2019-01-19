class SqlLiteral {
  constructor(parts, values) {
    this._parts = parts;
    this._values = values;
  }

  _resolve() {
    if (this._resolved === undefined) {
      const values = new Map();
      const text = this._resolveFor(values);
      this._resolved = { text, values: Array.from(values.keys()) };
    }
    return this._resolved;
  }

  _resolveFor(values) {
    return this._parts.reduce((prev, curr, i) => {
      const child = this._values[i - 1];
      let mid;
      if (child instanceof SqlLiteral) {
        mid = child._resolveFor(values);
      } else if (values.has(child)) {
        mid = '$' + values.get(child);
      } else {
        const i = values.size + 1;
        values.set(child, i);
        mid = '$' + i;
      }
      return prev + mid + curr;
    });
  }

  get text() {
    return this._resolve().text;
  }

  get values() {
    return this._resolve().values;
  }
}

export default
function SQLTag(parts, ...values) {
  return new SqlLiteral(parts, values);
}

export
function sqlLiteral(value) {
  return { text: value, values: [] };
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
