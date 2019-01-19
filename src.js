class SqlLiteral {
  constructor(parts, values) {
    this._parts = parts;
    this._values = values;
  }

  _resolve() {
    if (this._resolved === undefined) {
      const context = { fragments: new Map(), values: [] };
      const text = this._resolveFor(context);
      this._resolved = { text, values: context.values };
    }
    return this._resolved;
  }

  _resolveFor(context) {
    let fragment = context.fragments.get(this);
    if (fragment === undefined) {
      fragment = this._parts.reduce((prev, curr, i) => {
        const child = this._values[i - 1];
        let mid;
        if (child instanceof SqlLiteral) {
          mid = child._resolveFor(context);
        } else {
          context.values.push(child);
          mid = '$' + context.values.length;
        }
        return prev + mid + curr;
      });
      context.fragments.set(this, fragment);
    }
    return fragment;
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
  return new SqlLiteral([value]);
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
