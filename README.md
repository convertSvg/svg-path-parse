## svg-path-parse

This is a small library to normalise SVG paths based on those normalised paths.

Note: this package works with [path data](https://www.w3.org/TR/SVG11/paths.html#PathData) strings,
not with full svg xml sources.


## Usage 

Takes an SVG path string. The following code…

-------

```js
const { pathParse, serializePath } = require('./lib/path_parse')

const pathDatas = pathParse(__your_path__).getSegments()
// const pathDatas = pathParse(__your_path__).normalize()
// const pathDatas = pathParse(__your_path__).absNormalize()


// out put
// [
//   {type: 'M', args: [0, 0]},
//   {type: 'L', args: [10, 0]},
//   {type: 'L', args: [30, 0]},
//   {type: 'A', args: [15, 15, 1, 0, 1, 0, 0]}
// ]
```

## License

MIT
