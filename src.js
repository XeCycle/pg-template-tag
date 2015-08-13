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
