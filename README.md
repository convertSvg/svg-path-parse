## svg-path-parse

This is a small library to normalise SVG paths based on those normalised paths.

Note: this package works with [path data](https://www.w3.org/TR/SVG11/paths.html#PathData) strings and [Paths](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Tutorial/Paths),
not with full svg xml sources.

## Install 

```
npm install svg-path-parse
```

## Usage 

Takes an SVG path string. The following code…

-------

```js
const { pathParse, serializePath } = require('./lib/path_parse')

const pathDatas = pathParse(__your_path__).getSegments()
// const pathDatas = pathParse(__your_path__).normalize({round: 2})
// const pathDatas = pathParse(__your_path__).relNormalize({round: 2})
// const pathDatas = pathParse(__your_path__).absNormalize({round: 2})
// const pathDatas = pathParse(__your_path__).absCairo({round: 2})
// const pathDatas = pathParse(__your_path__).relCairo({round: 2})

// out put
// { err: '',  { type: 'M', args: [20, 20] },  { type: 'L', args: [30, 30] }}

serializePath(pathDatas)

console.log('pathDatas', serializePath(pathDatas))

// out put
// M896 480C894.656 480 893.536 480.608 892.256 480.768C894.72 479.84 893.568 479.232 892.256 479.232z
```
## API

### getSegments

Convert all path commands，data format as follows:

```js
// example
{ 
  err: '',
  segments:[ 
    [ 'M', 230, 230 ],
    [ 'A', 45, 45, 0, 1, 1, 275, 275 ],
    [ 'L', 275, 230 ],
    [ 'Z' ] 
  ] 
}
```

### normalize
Convert all path commands，data format as follows:

```js
// example
{ 
  err: '',
  segments:[ 
    { 'type': 'M', 'args' : [230, 230] },
    { 'type': 'A', 'args' : [45, 45, 0, 1, 1, 275, 275] },    
    { 'type': 'l', 'args' : [0, -45] },   
    { 'type': 'z', 'args' : [] }
  ] 
}
```

### absNormalize
Converts all path commands to absolute, data format as follows:

```js
// example
{ 
  err: '',
  segments:[ 
    { 'type': 'M', 'args' : [230, 230] },
    { 'type': 'A', 'args' : [45, 45, 0, 1, 1, 275, 275] },    
    { 'type': 'L', 'args' : [275, 230] },   
    { 'type': 'Z', 'args' : [] }
  ] 
}
```


### relNormalize
Converts all path commands to relative. Useful to reduce output size, data format as follows:

```js
// example
{ 
  err: '',
  segments:[ 
    { type: 'M', args: [ 230, 230 ] },
    { type: 'a', args: [ 45, 45, 0, 1, 1, 45, 45 ] },
    { type: 'l', args: [ 0, -45 ] },
    { type: 'z', args: [] } 
  ]
}
```

### absCairo

Converts all path commands to absolute based on [cairo](https://www.cairographics.org) and [CairoSVG](https://github.com/Kozea/CairoSVG). Converts smooth curves Q/q/T/t/S/s with "missed" control point to generic curves (C),  Converts V/v/H/h to lineto (L), data format as follows:

```js
// example
{ 
  err: '',
  segments:[ 
    { type: 'M', args: [ 230, 230 ] },
    { type: 'A',
      args: [ 230, 230, 0, 1, 1, 45, 0, 45, 3.14, 1.57 ] },
    { type: 'L', args: [ 275, 230 ] },
    { type: 'Z', args: [] } 
  ]
}
```

### relCairo
Converts all path commands to relative on [cairo](https://www.cairographics.org) and [CairoSVG](https://github.com/Kozea/CairoSVG). Converts smooth curves Q/q/T/t/S/s with "missed" control point to generic curves (C),  Converts V/v/H/h to lineto (L), data format as follows:

```js
// example
{ 
  err: '',
  segments:[ 
    { type: 'M', args: [ 230, 230 ] },
    { type: 'a',
      args: [ 230, 230, 0, 1, 1, 45, 0, 45, 3.14, 1.57 ] },
    { type: 'l', args: [ 0, -45 ] },
    { type: 'z', args: [] } 
  ]
}
```

### serializePath
Returns final path string.


## License

[MIT](./LICENSE)
