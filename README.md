#pg-template-tag
[![Build Status](https://travis-ci.org/XeCycle/pg-template-tag.svg)](https://travis-ci.org/XeCycle/pg-template-tag)

Build a { text, values } object for use with
[brianc/node-postgres](https://github.com/brianc/node-postgres/).
Supports nesting.

## Example

Write the query as-is inside template literals, use `${}` interpolation to
supply values.

```javascript
var SQL = require("pg-template-tag");
connection.query(SQL`select name from user where id=${id}`);
connection.query(SQL`select value from record where ${ lower===null ? SQL`true` : SQL`time > ${lower}`}`);
```

Pieces are reusable, so you can:

```javascript
var fields = SQL`name, time, score, history_avg(score) as "scoreAvg"`;
connection.query(SQL`select ${fields} from scores where time > current_date`);
connection.query(SQL`select ${fields} from scores where score > ${minScore}`);
```

There's a `.join` function analog to `Array.prototype.join` to join together literals.

```javascript
function filterUsers(filter) {
  var conditions = [];
  if (filter.email) conditions.push(SQL`email like ${filter.email}`);
  if (filter.minAge) conditions.push(SQL`age > ${filter.minAge}`);
  if (filter.maxAge) conditions.push(SQL`age < ${filter.maxAge}`);
  return connection.query(SQL`select * from users where ${SQL.join(conditions, ' and ')}`);
}
```
