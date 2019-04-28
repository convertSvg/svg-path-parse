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
 * 根据弧度获取角度
 * @param {*} x
 */
function trace (x) {
  // 弧度=角度*Math.PI/180
  return 180 * x / Math.PI
}

/**
 * 已知圆上的两点坐标和半径，求圆心
 * @param {*} x1, y1, x2, y2, R, x, y
 * large-arc-flag决定弧线是大于还是小于180度，0表示小角度弧，1表示大角度弧
 * sweepFlag表示弧线的方向，0表示从起点到终点沿逆时针画弧，1表示从起点到终点沿顺时针画弧
 * return cairo_arc (cairo_t *cr, double xc, double yc, double radius, double angle1, double angle2);
 */
function getCircleCenter (x1, y1, x2, y2, R, largeArcFlag, sweepFlag) {
  // console.error('arguments', arguments)
  // circle coordinate
  let x
  let y

  const c1 = (x2 * x2 - x1 * x1 + y2 * y2 - y1 * y1) / (2 * (x2 - x1))
  const c2 = (y2 - y1) / (x2 - x1) // 斜率
  const A = (c2 * c2 + 1)
  const B = (2 * x1 * c2 - 2 * c1 * c2 - 2 * y1)
  const C = x1 * x1 - 2 * x1 * c1 + c1 * c1 + y1 * y1 - R * R


  if ((largeArcFlag === 0 && sweepFlag === 0) || (largeArcFlag === 1 && sweepFlag === 1)) {
    y = (-B - Math.sqrt(B * B - 4 * A * C)) / (2 * A)
    x = c1 - c2 * y
  } else {
    y = (-B + Math.sqrt(B * B - 4 * A * C)) / (2 * A)
    x = c1 - c2 * y
  }

  // Math.atan2 算出来是基于第二象限, svg 坐标的不一致注意
  let startAngle = Math.atan2(y - y1, x1 - x)
  let endAngle = Math.atan2(y - y2, x2 - x)

  // 第一象限 trace(Math.atan2(4, 4)) 45度 第二象限 trace(Math.atan2(4, -4)) 135度
  // 第三象限 trace(Math.atan2(-4, -4)) -135度 第四象限 trace(Math.atan2(-4, 4)) -45度
  // cairo 是从第四象限往第一象限顺时针运作，正向 0 ～ 2 * Math.PI

  startAngle = trace(startAngle) > 0 ? 360 - trace(startAngle) : Math.abs(trace(startAngle))
  endAngle = trace(endAngle) > 0 ? 360 - trace(endAngle) : Math.abs(trace(endAngle))

  // console.error('Math.atan2(y1 - y, x1 - x)', trace(startAngle))
  // console.error('Math.atan2(y2 - y, x2 - x)', trace(endAngle))

  if ((largeArcFlag === 0 && sweepFlag === 0) || (largeArcFlag === 1 && sweepFlag === 0)) {
    [startAngle, endAngle] = [endAngle, startAngle]
  }
  // console.error('########半径坐标############')
  // console.error(y, x)
  // console.error('#########半径坐标###########')

  // console.error('[x, y, R, startAngle/360, endAngle/360]', [x, y, R, startAngle / 360, endAngle / 360])
  // console.error('####################')
  // 需要切到第一象限
  return [x, y, R, startAngle / 360, endAngle / 360]
}

module.exports = {
  unicodeToString,
  utf8ToString,
  toDecimal,
  getCircleCenter,
}
