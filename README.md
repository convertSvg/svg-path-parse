## svg-path-parse
Note: this package works with path data strings, not with full svg xml sources.


## Example
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


- 所有指令都表示为一个字符（例如，moveto表示为M）。
- 可以消除多余的空白区域和诸如逗号的分隔符（例如，“M 100 100 L 200 200”包含不必要的空间并且可以更紧凑地表达为“M100 100L200 200”）。
- 如果连续多次使用相同的命令，则可以在后续命令中删除命令字母（例如，您可以在“M 100 200 L 200 100 L -100 -200”中删除第二个“L”并使用“M 100”
200 L 200 100 -100 -200“而不是”。
- 所有命令的相对版本都可用（大写表示绝对坐标，小写表示相对坐标）。
- 替代形式的lineto可用于优化水平和垂直线（绝对和相对）的特殊情况。
- 可以使用替代形式的曲线来优化特殊情况，其中当前段上的一些控制点可以从前一段的控制点自动确定。
