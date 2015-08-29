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
    let all = [this, ...literals];
    // concatenate all parts arrays combining first and last element of each
    let combinedParts = all.map((lit) => lit._parts)
      .reduce((total, next, i) => {
        if (i > 0) {
          let [head, ...rest] = next;
          total[total.length - 1] += head;
          return total.concat(rest);
        } else {
          return total.concat(next)
        }
      }, []);
    let combinedValues = Array.prototype.concat(...all.map((lit) => lit._values));
    return new SqlLiteral(combinedParts, combinedValues);
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
          } else {
            splitted[splitted.length - 1]._parts.push(head);
            splitted[splitted.length - 1]._values.push(value);
          }
        }
        return splitted.concat(splittedPart.map((part) => new SqlLiteral([ part ], [])));
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
