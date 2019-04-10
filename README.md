Example
-------

```js
var svgpath = require('svg-path-parse');

var transformed = svgpath(__your_path__)


// out put
// [
//   {type: 'M', args: [0, 0]},
//   {type: 'L', args: [10, 0]},
//   {type: 'L', args: [30, 0]},
//   {type: 'A', args: [15, 15, 1, 0, 1, 0, 0]}
// ]
```

