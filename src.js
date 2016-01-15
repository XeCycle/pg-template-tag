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
  concat(...literals) {
    // concatenate all parts arrays combining first part of each one with the
    // last part of the previous one
    return [this, ...literals].reduce((result, next) => {
      let [head, ...rest] = next._parts;
      result._parts[result._parts.length - 1] += head;
      result._parts = result._parts.concat(rest);
      result._values = result._values.concat(next._values);
      return result;
    }, new SqlLiteral([''], []));
  }
  split(pattern) {
    return this._parts
      .reduce((splitted, nextPart, i) => {
        let splittedPart = nextPart.split(pattern);
        if (i > 0) {
          let head = splittedPart.shift();
          let value = this._values[i - 1];
          if (value instanceof SqlLiteral) {
            let [first, ...rest] = value.split(pattern);
            splitted[splitted.length - 1] = splitted[splitted.length - 1].concat(first);
            splitted = splitted.concat(rest);
            splitted[splitted.length - 1] = splitted[splitted.length - 1].concat(new SqlLiteral([head], []));
          } else {
            splitted[splitted.length - 1] = splitted[splitted.length - 1].concat(new SqlLiteral(['', head], [value]));
          }
        }
        splitted = splitted.concat(splittedPart.map(part => new SqlLiteral([ part ], [])));
        return splitted;
      }, []);
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
