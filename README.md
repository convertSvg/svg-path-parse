## svg-path-parse

This is a small library to normalise SVG paths based on those normalised paths.

Note: this package works with [path data](https://www.w3.org/TR/SVG11/paths.html#PathData) strings and [Paths](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Tutorial/Paths),
not with full svg xml sources.


## Usage 

Takes an SVG path string. The following code…

-------

```js
const { pathParse, serializePath } = require('./lib/path_parse')

const pathDatas = pathParse(__your_path__).getSegments()
// const pathDatas = pathParse(__your_path__).normalize({round: 2})
// const pathDatas = pathParse(__your_path__).absNormalize({round: 2})

serializePath(pathDatas)

console.log('pathDatas', serializePath(pathDatas))

// out put
// M896 480C894.656 480 893.536 480.608 892.256 480.768C894.72 479.84 893.568 479.232 892.256 479.232z
```
## API
### getSegments
### normalize
### absNormalize
### relNormalize
### serializePath


## License

MIT





