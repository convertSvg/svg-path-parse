const a2c = require('./a2c')

/**
 * unicode 转 string
 * @param {*} code 十六进制
 * utf-8 编码格式 如 0x2001  unicode 编码格式 \u2001
 * str.charCodeAt(0) Unicode 编码值 20013
 */
function unicodeToString (code) {
  return String.fromCharCode(code)
}

/**
 * utf-8 转十进制字符串
 * @param {*} code 十六进制
 * utf-8 编码格式 如 0x2001  unicode 编码格式 \u2001
 */
function utf8ToString (code) {
  return String.fromCharCode(parseInt(code, 16))
}


/**
 * 利用Math.round
 * 保留两位小数
 */
function toDecimal (num, rel = 2) {
  const tar = parseFloat(num)
  if (isNaN(tar)) { return }
  return Math.round(num * Math.pow(10, rel)) / Math.pow(10, rel)
}

/**
 * 根据角度获取弧度
 * @param {*} radians
 * degrees_to_radians
 */
function radians (degrees) {
  return degrees * (Math.PI / 180)
}


/**
 * 根据弧度获取角度
 * @param {*} radians
 * radians_to_degrees
 */
// eslint-disable-next-line no-unused-vars
function degrees (radians) {
  // 弧度=角度*Math.PI/180
  return 180 * radians / Math.PI
}

/**
 * 坐标点根据圆心旋转
 * @param {*} x
 * @param {*} y
 * @param {*} angle
 */
function rotate (x, y, angle) {
  // Rotate a point of an angle around the origin point.
  return [x * Math.cos(angle) - y * Math.sin(angle), y * Math.cos(angle) + x * Math.sin(angle)]
}

/**
 * 根据给定中心的x轴和点之间的返回角度--斜率
 * @param {*} cx
 * @param {*} cy
 * @param {*} px
 * @param {*} py
 */
function pointAngle (cx, cy, px, py) {
  // Return angle between x axis and point knowing given center.
  return Math.atan2(py - cy, px - cx)
}

/**
 * Inspired by CairoSVG https://github.com/Kozea/CairoSVG/blob/11ee7772bd3f86bac31ff99a6e9f3a03b1e0edc4/cairosvg/path.py#L173
 * 已知圆上的两点坐标和半径，求圆心
 * @param {*} x1, y1, x2, y2, R, x, y
 * large-arc-flag决定弧线是大于还是小于180度，0表示小角度弧，1表示大角度弧
 * sweepFlag表示弧线的方向，0表示从起点到终点沿逆时针画弧，1表示从起点到终点沿顺时针画弧
 * return cairo_arc (cairo_t *cr, double xc, double yc, double radius, double angle1, double angle2);
 */
function getCircleCenter (x1, y1, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x2, y2) {
  const rotation = radians(parseFloat(xAxisRotation))
  const radii_ratio = ry / rx

  // Absolute x3 and y3, convert to relative
  x2 -= x1
  y2 -= y1

  // Cancel the rotation of the second point
  let [xe, ye] = rotate(x2, y2, -rotation)
  ye /= radii_ratio

  // Find the angle between the second point and the x axis
  const angle = pointAngle(0, 0, xe, ye)

  // Put the second point onto the x axis
  xe = (xe ** 2 + ye ** 2) ** 0.5
  ye = 0

  rx = Math.max(rx, xe / 2)

  // Find one circle centre
  let xc = xe / 2
  // ** 幂
  let yc = (rx ** 2 - xc ** 2) ** 0.5

  // 按位异或运算符 都为 1 才为1
  if (!(largeArcFlag ^ sweepFlag)) {
    yc = -yc
  }

  // Put the second point and the center back to their positions
  [xe, ye] = rotate(xe, 0, angle);
  [xc, yc] = rotate(xc, yc, angle)

  // Find the drawing angles
  const startAngle = pointAngle(xc, yc, 0, 0)
  const endAngle = pointAngle(xc, yc, xe, ye)
  // console.error('[x1, y1, rotation, sweepFlag, radii_ratio, xc, yc, rx, startAngle, endAngle]', [x1, y1, rotation, sweepFlag, radii_ratio, xc, yc, rx, startAngle, endAngle])
  return [x1, y1, rotation, sweepFlag, radii_ratio, xc, yc, rx, startAngle, endAngle]
}

// Quadratic curve convert to Curve
function quadraticPoints (x, y, x1, y1, x2, y2) {
  // Return the quadratic points to create quadratic curves.
  const xq1 = x1 * 2 / 3 + x / 3
  const yq1 = y1 * 2 / 3 + y / 3
  const xq2 = x1 * 2 / 3 + x2 / 3
  const yq2 = y1 * 2 / 3 + y2 / 3
  return [xq1, yq1, xq2, yq2, x2, y2]
}

function arcTransfromCurve (name, s, x, y) {
  let nextX
  let nextY
  const result = []

  // Skip anything except arcs
  if (name !== 'A' && name !== 'a') { return null }

  if (name === 'a') {
    // convert relative arc coordinates to absolute
    nextX = x + s[5]
    nextY = y + s[6]
  } else {
    nextX = s[5]
    nextY = s[6]
  }

  const new_segments = a2c(x, y, nextX, nextY, s[3], s[4], s[0], s[1], s[2])

  // Degenerated arcs can be ignored by renderer, but should not be dropped
  // to avoid collisions with `S A S` and so on. Replace with empty line.
  if (new_segments.length === 0) {
    return [ [ name === 'a' ? 'l' : 'L', s[5], s[6] ] ]
  }

  new_segments.forEach(d => {
    result.push([ 'C', d[2], d[3], d[4], d[5], d[6], d[7] ])
  })

  return result
}


/**
 * parseTransform  解析 xml  tranfrom
 * [ { name: 'rotate', data: [10] } ]
 * @param {*} transformString
 */
const parseTransform = transformString => {
  const transformTypesReg = /matrix|translate|scale|rotate|skewX|skewY/
  const transformSplitReg = /\s*(matrix|translate|scale|rotate|skewX|skewY)\s*\(\s*(.+?)\s*\)[\s,]*/
  const numericValuesReg = /[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g

  const transforms = []
  let current

  // split value into ['', 'translate', '10 50', '', 'scale', '2', '', 'rotate', '-45', '']
  transformString.split(transformSplitReg).forEach(item => {
    let num
    if (item) {
      // if item is a translate function
      if (transformTypesReg.test(item)) {
        // then collect it and change current context
        current = { name: item }
        transforms.push(current)
        // else if item is data
      } else {
        // then split it into [10, 50] and collect as context.data
        // eslint-disable-next-line no-cond-assign
        while ((num = numericValuesReg.exec(item))) {
          num = Number(num)
          if (current.data) {
            current.data.push(num)
          } else {
            current.data = [num]
          }
        }
      }
    }
  })

  // return empty array if broken transform (no data)
  return current && current.data ? transforms : []
}

module.exports = {
  unicodeToString,
  utf8ToString,
  toDecimal,
  getCircleCenter,
  quadraticPoints,
  pointAngle,
  arcTransfromCurve,
  parseTransform,
}
