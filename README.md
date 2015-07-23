#pg-template-tag
[![Build Status](https://travis-ci.org/XeCycle/pg-template-tag.svg)](https://travis-ci.org/XeCycle/pg-template-tag)

Build a { text, values } object for use with
[brianc/node-postgres](https://github.com/brianc/node-postgres/).
Supports nesting.

## Example

```javascript
var SQL = require("pg-template-tag");
connection.query(SQL`select name from user where id=${id}`);
connection.query(SQL`select value from record where ${ lower===null ? SQL`true` : SQL`time > ${lower}`}`);
```
