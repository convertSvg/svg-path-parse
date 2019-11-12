
const { toDecimal, getCircleCenter, quadraticPoints, arcTransfromCurve, parseTransform } = require('./utils')
const { matrix } = require('./matrix')
// 路径绘制参数 z 是闭合 https://www.w3.org/TR/SVG11/paths.html#PathData  path路径原理，是对d值按顺序做裁切匹配
const paramCounts = { a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0 }

// \u 代表unicode编码 , 0x 开头代表十六进制
// 0x1680 -> " ", 0x180E,0xFEFF -> "᠎", 0x2000 ->" ", 0x2001 ->" ", 0x2002 ->" ", 0x2003 ->" ", 0xFEFF是 65279 位unicode 阿拉伯字体 ﻯ
const SPECIAL_SPACES = [
  0x1680, 0x180E, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006,
  0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000, 0xFEFF
]

/**
 * transformPath 处理 matrix scale rotate translate skewX skewY
 * @param {*} opts
 * @param {*} result
 */
const transformPath = (opts = {}, result = []) => {
  const { round = 0, transform = '' } = opts
  if (transform) {
    const matrixArr = []
    parseTransform(transform).map(({ name, data }) => {
      switch (name) {
        case 'matrix':
          matrixArr.push([
            data[0], data[2], data[4],
            data[1], data[3], data[5],
            0, 0, 1
          ])
          break
        case 'translate':
          matrixArr.push(matrix.translate(...data))
          break
        case 'scale':
          matrixArr.push(matrix.scale(...data))
          break
        case 'rotate':
          matrixArr.push(matrix.rotate(...data))
          break
        case 'skewX':
          matrixArr.push(matrix.skewX(...data))
          break
        case 'skewY':
          matrixArr.push(matrix.skewY(...data))
          break
      }
    })

    const svgMatrix = matrix.combine(...matrixArr)

    let prevPos = [0, 0]
    let matrixPos = [0, 0]
    let coordPos = { x: 0, y: 0 }

    result = result.map((item, index) => {
      let comd = item.type
      item = item.args
      if (index > 0) {
        const code = comd.charCodeAt(0)
        const [x, y] = prevPos
        const [x1, y1] = matrixPos
        // comd = comd.toUpperCase()
        switch (code) {
          // lower
          case 0x6D/* m 2 params */:
            item[0] += x
            item[1] += y
            prevPos = item.slice(0)
            coordPos = matrix.getCoordinateTransform(prevPos[0], prevPos[1], svgMatrix)
            matrixPos = [coordPos.x, coordPos.y]
            item = [coordPos.x - x1, coordPos.y - y1]
            break
          case 0x7A/* z 0 params */:
            break
          case 0x6C/* l 2 params */:
            item[0] += x
            item[1] += y
            prevPos = item.slice(0)
            coordPos = matrix.getCoordinateTransform(prevPos[0], prevPos[1], svgMatrix)
            matrixPos = [coordPos.x, coordPos.y]
            item = [coordPos.x - x1, coordPos.y - y1]
            break
          case 0x68/* h 1 params */:
            item[0] += x
            prevPos = [item[0], y]
            coordPos = matrix.getCoordinateTransform(prevPos[0], prevPos[1], svgMatrix)
            matrixPos = [coordPos.x, coordPos.y]
            if (coordPos.y - y1 === 0) {
              item = [coordPos.x - x1]
            } else {
              comd = 'l'
              item = [coordPos.x - x1, coordPos.y - y1]
            }
            break
          case 0x76/* v 1 params */:
            item[0] += y
            prevPos = [x, item[0]]
            coordPos = matrix.getCoordinateTransform(prevPos[0], prevPos[1], svgMatrix)
            matrixPos = [coordPos.x, coordPos.y]
            if (coordPos.x - x1 === 0) {
              item = [coordPos.y - y1]
            } else {
              comd = 'l'
              item = [coordPos.x - x1, coordPos.y - y1]
            }
            break
          case 0x63/* c 6 params */:
            item[0] += x
            item[1] += y
            item[2] += x
            item[3] += y
            item[4] += x
            item[5] += y
            prevPos = [item[4], item[5]]
            // eslint-disable-next-line no-var
            var pos1 = matrix.getCoordinateTransform(item[0], item[1], svgMatrix)
            // eslint-disable-next-line no-var
            var pos2 = matrix.getCoordinateTransform(item[2], item[3], svgMatrix)
            // eslint-disable-next-line no-var
            var pos3 = matrix.getCoordinateTransform(item[4], item[5], svgMatrix)
            matrixPos = [pos3.x, pos3.y]
            item = [pos1.x - x1, pos1.y - y1, pos2.x - x1, pos2.y - y1, pos3.x - x1, pos3.y - y1 ]
            break
          case 0x73/* s 4 params */:
            item[0] += x
            item[1] += y
            item[2] += x
            item[3] += y
            prevPos = [item[2], item[3]]
            // eslint-disable-next-line
            var pos1 = matrix.getCoordinateTransform(item[0], item[1], svgMatrix)
            // eslint-disable-next-line
            var pos2 = matrix.getCoordinateTransform(item[2], item[3], svgMatrix)
            matrixPos = [pos2.x, pos2.y]
            item = [pos1.x - x1, pos1.y - y1, pos2.x - x1, pos2.y - y1 ]
            break
          case 0x71/* q 4 params */:
            item[0] += x
            item[1] += y
            item[2] += x
            item[3] += y
            prevPos = [item[2], item[3]]
            // eslint-disable-next-line
            var pos1 = matrix.getCoordinateTransform(item[0], item[1], svgMatrix)
            // eslint-disable-next-line
            var pos2 = matrix.getCoordinateTransform(item[2], item[3], svgMatrix)
            matrixPos = [pos2.x, pos2.y]
            item = [pos1.x - x1, pos1.y - y1, pos2.x - x1, pos2.y - y1 ]
            break
          case 0x74/* t 2 params */:
            item[0] += x
            item[1] += y
            prevPos = item.slice(0)
            coordPos = matrix.getCoordinateTransform(prevPos[0], prevPos[1], svgMatrix)
            matrixPos = [coordPos.x, coordPos.y]
            item = [coordPos.x - x1, coordPos.y - y1]
            break

          // Upper
          case 0x4D/* M 2 params */:
            prevPos = item.slice(0)
            coordPos = matrix.getCoordinateTransform(prevPos[0], prevPos[1], svgMatrix)
            matrixPos = [coordPos.x, coordPos.y]
            item = [coordPos.x, coordPos.y]
            break
          case 0x5A/* Z 0 params */:
            break
          case 0x4C/* L 2 params */:
            prevPos = item.slice(0)
            coordPos = matrix.getCoordinateTransform(prevPos[0], prevPos[1], svgMatrix)
            matrixPos = [coordPos.x, coordPos.y]
            item = [coordPos.x, coordPos.y]
            break
          case 0x48/* H 1 params */:
            prevPos = [item[0], y]
            coordPos = matrix.getCoordinateTransform(prevPos[0], prevPos[1], svgMatrix)
            matrixPos = [coordPos.x, coordPos.y]
            if (coordPos.y - y1 === 0) {
              item = [coordPos.x]
            } else {
              comd = 'L'
              item = [coordPos.x, coordPos.y]
            }
            break
          case 0x56/* V 1 params */:
            prevPos = [x, item[0]]
            coordPos = matrix.getCoordinateTransform(prevPos[0], prevPos[1], svgMatrix)
            matrixPos = [coordPos.x, coordPos.y]
            if (coordPos.x - x1 === 0) {
              item = [coordPos.y]
            } else {
              comd = 'L'
              item = [coordPos.x, coordPos.y]
            }
            break
          case 0x43/* C 6 params */:
            prevPos = [item[4], item[5]]
            // eslint-disable-next-line
            var pos1 = matrix.getCoordinateTransform(item[0], item[1], svgMatrix)
            // eslint-disable-next-line
            var pos2 = matrix.getCoordinateTransform(item[2], item[3], svgMatrix)
            // eslint-disable-next-line
            var pos3 = matrix.getCoordinateTransform(item[4], item[5], svgMatrix)
            matrixPos = [pos3.x, pos3.y]
            item = [pos1.x, pos1.y, pos2.x, pos2.y, pos3.x, pos3.y]
            break
          case 0x53/* S 4 params */:
          case 0x51/* Q 4 params */:
            prevPos = [item[2], item[3]]
            // eslint-disable-next-line
            var pos1 = matrix.getCoordinateTransform(item[0], item[1], svgMatrix)
            // eslint-disable-next-line
            var pos2 = matrix.getCoordinateTransform(item[2], item[3], svgMatrix)
            matrixPos = [pos2.x, pos2.y]
            item = [pos1.x, pos1.y, pos2.x, pos2.y]
            break
          case 0x54/* T 2 params */:
            prevPos = [item[0], item[1]]
            coordPos = matrix.getCoordinateTransform(prevPos[0], prevPos[1], svgMatrix)
            matrixPos = [coordPos.x, coordPos.y]
            item = [coordPos.x, coordPos.y]
            break
        }
      } else { // first M two params
        prevPos = item.slice(0)
        coordPos = matrix.getCoordinateTransform(prevPos[0], prevPos[1], svgMatrix)
        matrixPos = [coordPos.x, coordPos.y]
        item = [coordPos.x, coordPos.y]
      }

      return {
        type: comd,
        args: item
      }
    })
  }

  // round
  round > 0 && result.forEach(item => {
    item.args.map((it, idx) => {
      item.args[idx] = toDecimal(it, round)
    })
  })
  return result
}


class State {
  constructor (path) {
    this.index = 0
    this.path = path
    this.max = path.length
    this.result = []
    this.param = 0.0
    this.err = ''
    this.segmentStart = 0
    this.data = []
  }
  // type [0, 1, 2] => Segments、normalize、absnormalize
  normalize (opts) {
    if (opts.transform) this.unArc()
    const { err, result = [] } = this
    if (err.length) {
      this.result = []
      return
    }
    this.result = result.map(item => {
      const comd = item.shift()
      return {
        type: comd,
        args: item
      }
    })

    return {
      err,
      type: 1,
      segments: transformPath(opts, this.result),
    }
  }

  unArc () {
    const { err, result = [] } = this
    if (err.length) {
      this.result = []
      return
    }
    let iterate = []
    let prevPos = [0, 0]
    this.result = result.map((item, index) => {
      const comd = item.shift()
      let isArc = false
      if (index > 0) {
        const code = comd.charCodeAt(0)
        const [x, y] = prevPos
        switch (code) {
          // lower
          case 0x6D/* m 2 params */:
            prevPos = [item[0] + x, item[1] + y]
            break
          case 0x7A/* z 0 params */:
            break
          case 0x6C/* l 2 params */:
            prevPos = [item[0] + x, item[1] + y]
            break
          case 0x68/* h 1 params */:
            // item[0] += x
            prevPos = [item[0] + x, y]
            break
          case 0x76/* v 1 params */:
            // item[0] += y
            prevPos = [x, item[0] + y]
            break
          case 0x63/* c 6 params */:
            prevPos = [item[4] + x, item[5] + y]
            break
          case 0x73/* s 4 params */:
            prevPos = [item[2] + x, item[3] + y]
            break
          case 0x71/* q 4 params */:
            prevPos = [item[2] + x, item[3] + y]
            break
          case 0x74/* t 2 params */:
            prevPos = [ item[0] + x, item[1] + y]
            break
          case 0x61/* a 7 params */:
            prevPos = [item[5] + x, item[6] + y]
            isArc = true
            item = arcTransfromCurve('a', item, x, y)
            break

          // Upper
          case 0x4D/* M 2 params */:
            prevPos = item
            break
          case 0x5A/* Z 0 params */:
            break
          case 0x4C/* L 2 params */:
            prevPos = item
            break
          case 0x48/* H 1 params */:
            prevPos = [item[0], y]
            break
          case 0x56/* V 1 params */:
            prevPos = [x, item[0]]
            break
          case 0x43/* C 6 params */:
            prevPos = [item[4], item[5]]
            break
          case 0x53/* S 4 params */:
          case 0x51/* Q 4 params */:
            prevPos = [item[2], item[3]]
            break
          case 0x54/* T 2 params */:
            prevPos = [item[0], item[1]]
            break
          case 0x41/* A 7 params */:
            prevPos = [item[5], item[6]]
            isArc = true
            item = arcTransfromCurve('A', item, x, y)
            break
        }
      } else { // first M two params
        prevPos = item
      }

      if (isArc) {
        iterate = iterate.concat(item)
      } else {
        iterate = iterate.concat([[comd, ...item]])
      }
    })

    this.result = iterate
  }

  // attention coordinates
  absCairo (opts = { round: 2 }) {
    this.unArc()
    const { err, result = [] } = this
    if (err.length) {
      this.result = []
      return
    }

    let prevPos = [0, 0]
    let prevComd = ''
    let qPos = [0, 0] // record Q control point
    this.result = result.map((item, index) => {
      let comd = item.shift()
      let tempComd = comd

      if (index > 0) {
        const code = comd.charCodeAt(0)
        const [x, y, a, b] = prevPos // a, b record C/c/S/s second control point
        comd = comd.toUpperCase()
        switch (code) {
          // lower
          case 0x6D/* m 2 params */:
            item[0] += x
            item[1] += y
            prevPos = item
            break
          case 0x7A/* z 0 params */:
            break
          case 0x6C/* l 2 params */:
            item[0] += x
            item[1] += y
            prevPos = item
            break
          case 0x68/* h 1 params */:
            comd = 'L'
            item[0] += x
            item[1] = y
            prevPos = [item[0], y]
            break
          case 0x76/* v 1 params */:
            comd = 'L'
            item[0] += y
            item[1] = item[0]
            item[0] = x
            prevPos = [x, item[1]]
            break
          case 0x63/* c 6 params */:
            item[0] += x
            item[1] += y
            item[2] += x
            item[3] += y
            item[4] += x
            item[5] += y
            prevPos = [item[4], item[5], item[2], item[3]]
            break
          case 0x73/* s 4 params Smooth curve */:
            item[0] += x
            item[1] += y
            item[2] += x
            item[3] += y
            prevPos = [item[2], item[3], item[0], item[1]]

            {
              comd = 'C'
              tempComd = 'C'

              let x1 = x
              let y1 = y
              // S命令跟在一个C或S命令后面，则第一个控制点会是前一个命令曲线的第二个控制点的中心对称点；若S命令单独使用，前面没有C或S命令，那当前点将作为第一个控制点
              if ('SsCc'.split('').includes(prevComd) && a !== 'undefined' && b !== 'undefined') {
                x1 = x + (x - a)
                y1 = y + (y - b)
              }

              item = [x1, y1, ...item]
            }

            break
          case 0x71/* q 4 params */:
            item[0] += x
            item[1] += y
            item[2] += x
            item[3] += y
            qPos = [item[0], item[1]]
            prevPos = [item[2], item[3]]
            comd = 'C'
            tempComd = 'C'

            item = quadraticPoints(x, y, ...item)
            break
          case 0x74/* t 2 params smooth quadratic Bézier */:
            item[0] += x
            item[1] += y
            prevPos = item

            {
              comd = 'C'
              tempComd = 'C'

              // default lineto
              let x1 = item[0]
              let y1 = item[1]
              let x2 = item[0]
              let y2 = item[1]
              // T命令前面必须是一个Q命令，或者是另一个T命令，推断出一个新的控制点，若T单独使用，那么控制点就会被认为和终点是同一个点
              // T => Q => C
              if ('QqTt'.split('').includes(prevComd)) {
                const [x0, y0] = qPos
                x1 = x
                y1 = y
                x2 = (item[0] + x) / 2
                y2 = 2 * y1 - y0
                qPos = [x2, y2]
                item = quadraticPoints(x1, y1, x2, y2, ...item)
              } else {
                qPos = [item[0], item[1]]
                item = [x1, y1, x2, y2, ...item]
              }
            }

            break
          case 0x61/* a 7 params  drawing arc */:
            item[5] += x
            item[6] += y
            prevPos = [item[5], item[6]]
            // circle ellipse
            // x, y (item[0] item[1]) item[2] item[3] item[4] item[5] item[6] => x0 y0 rx ry x-axis-rotation large-arc-flag sweep-flag x1 y1
            item = getCircleCenter(x, y, item[0], item[1], item[2], item[3], item[4], item[5], item[6])
            break

          // Upper
          case 0x4D/* M 2 params */:
            prevPos = item
            break
          case 0x5A/* Z 0 params */:
            break
          case 0x4C/* L 2 params */:
            prevPos = item
            break
          case 0x48/* H 1 params */:
            comd = 'L'
            prevPos = [item[0], y]
            item = [item[0], y]
            break
          case 0x56/* V 1 params */:
            comd = 'L'
            prevPos = [x, item[0]]
            item = [x, item[0]]
            break
          case 0x43/* C 6 params */:
            prevPos = [item[4], item[5], item[2], item[3]]
            break
          case 0x53/* S 4 params */:
            prevPos = [item[2], item[3], item[0], item[1]]

            {
              comd = 'C'
              tempComd = 'C'
              let x1 = x
              let y1 = y
              // S命令跟在一个C或S命令后面，则第一个控制点会是前一个命令曲线的第二个控制点的中心对称点；若S命令单独使用，前面没有C或S命令，那当前点将作为第一个控制点
              if ('SsCc'.split('').includes(prevComd) && a !== 'undefined' && b !== 'undefined') {
                x1 = x + (x - a)
                y1 = y + (y - b)
              }

              item = [x1, y1, ...item]
            }

            break
          case 0x51/* Q 4 params */:
            prevPos = [item[2], item[3]]
            qPos = [item[0], item[1]]
            comd = 'C'
            tempComd = 'C'
            item = quadraticPoints(x, y, ...item)
            break
          case 0x54/* T 2 params smooth quadratic Bézier */:
            prevPos = [item[0], item[1]]

            {
              comd = 'C'
              tempComd = 'C'
              // default lineto
              let x1 = item[0]
              let y1 = item[1]
              let x2 = item[0]
              let y2 = item[1]
              // T命令前面必须是一个Q命令，或者是另一个T命令，推断出一个新的控制点，若T单独使用，那么控制点就会被认为和终点是同一个点
              // T => Q => C
              if ('QqTt'.split('').includes(prevComd)) {
                const [x0, y0] = qPos
                x1 = x
                y1 = y
                x2 = (item[0] + x1) / 2
                y2 = 2 * y1 - y0
                qPos = [x2, y2]
                item = quadraticPoints(x1, y1, x2, y2, ...item)
              } else {
                qPos = [item[0], item[1]]
                item = [x1, y1, x2, y2, ...item]
              }
            }

            break
          case 0x41/* A 7 params  drawing arc */:
            prevPos = [item[5], item[6]]
            // x, y (item[0] item[1]) item[2] item[3] item[4] item[5] item[6] => x0 y0 rx ry x-axis-rotation large-arc-flag sweep-flag x1 y1
            item = getCircleCenter(x, y, item[0], item[1], item[2], item[3], item[4], item[5], item[6])
            break
        }
      } else { // first M two params
        prevPos = item
      }

      prevComd = tempComd

      return {
        type: comd,
        args: item
      }
    })

    return {
      err,
      type: 2,
      segments: transformPath(opts, this.result),
    }
  }

  // attention coordinates
  relCairo (opts = { round: 2 }) {
    this.absCairo()
    const { err, result = [] } = this
    if (err.length) {
      this.result = []
      return
    }
    let prevPos = [0, 0] // abs coordinates
    let isClosePath = false
    this.result = result.map((item, index) => {
      let comd = item.type
      item = item.args
      if (index > 0) {
        let code = comd.charCodeAt(0)

        // z|Z after uppercase
        if (!isClosePath) {
          comd = comd.toLowerCase()
        } else {
          isClosePath = false
          code |= 0x20
          prevPos = [0, 0]
        }
        const [x, y] = prevPos

        switch (code) {
          // Upper
          case 0x4D/* M 2 params */:
            prevPos = [item[0], item[1]]
            item[0] += -x
            item[1] += -y
            break
          case 0x5A/* Z 0 params */:
            isClosePath = true
            break
          case 0x4C/* L 2 params */:
            prevPos = [item[0], item[1]]
            item[0] += -x
            item[1] += -y
            break
          case 0x48/* H 1 params */:
            prevPos = [item[0], y]
            item[0] += -x
            break
          case 0x56/* V 1 params */:
            prevPos = [x, item[0]]
            item[0] += -y
            break
          case 0x43/* C 6 params */:
            prevPos = [item[4], item[5]]
            item[0] += -x
            item[1] += -y
            item[2] += -x
            item[3] += -y
            item[4] += -x
            item[5] += -y
            break
          case 0x53/* S 4 params */:
            prevPos = [item[2], item[3]]
            item[0] += -x
            item[1] += -y
            item[2] += -x
            item[3] += -y
            break
          case 0x51/* Q 4 params */:
            prevPos = [item[2], item[3]]
            item[0] += -x
            item[1] += -y
            item[2] += -x
            item[3] += -y
            break
          case 0x54/* T 2 params */:
            prevPos = [item[0], item[1]]
            item[0] += -x
            item[1] += -y
            break
          case 0x41/* A 7 params */:
            prevPos = [item[5], item[6]]
            item[5] += -x
            item[6] += -y
            break

          // lower
          case 0x6D/* m 2 params */:
            prevPos = [item[0] + x, item[1] + y]
            break
          case 0x7A/* z 0 params */:
            isClosePath = true
            break
          case 0x6C/* l 2 params */:
            prevPos = [item[0] + x, item[1] + y]
            break
          case 0x68/* h 1 params */:
            prevPos = [item[0] + x, y]
            break
          case 0x76/* v 1 params */:
            prevPos = [x, item[0] + y]
            break
          case 0x63/* c 6 params */:
            prevPos = [item[4] + x, item[5] + y]
            break
          case 0x73/* s 4 params */:
            prevPos = [item[2] + x, item[3] + y]
            break
          case 0x71/* q 4 params */:
            prevPos = [item[2] + x, item[3] + y]
            break
          case 0x74/* t 2 params */:
            prevPos = [item[0] + x, item[1] + y]
            break
          case 0x61/* a 7 params */:
            prevPos = [item[5] + x, item[6] + y]
            break
        }
      } else { // first M two params
        prevPos = item
      }

      return {
        type: comd,
        args: item
      }
    })

    return {
      err,
      type: 2,
      segments: transformPath(opts, this.result),
    }
  }


  // attention coordinates
  absNormalize (opts = { round: 2 }) {
    if (opts.transform) this.unArc()
    const { err, result = [] } = this
    if (err.length) {
      this.result = []
      return
    }
    let prevPos = [0, 0]
    this.result = result.map((item, index) => {
      let comd = item.shift()
      if (index > 0) {
        const code = comd.charCodeAt(0)
        const [x, y] = prevPos
        comd = comd.toUpperCase()
        switch (code) {
          // lower
          case 0x6D/* m 2 params */:
            item[0] += x
            item[1] += y
            prevPos = item
            break
          case 0x7A/* z 0 params */:
            break
          case 0x6C/* l 2 params */:
            item[0] += x
            item[1] += y
            prevPos = item
            break
          case 0x68/* h 1 params */:
            item[0] += x
            prevPos = [item[0], y]
            break
          case 0x76/* v 1 params */:
            item[0] += y
            prevPos = [x, item[0]]
            break
          case 0x63/* c 6 params */:
            item[0] += x
            item[1] += y
            item[2] += x
            item[3] += y
            item[4] += x
            item[5] += y
            prevPos = [item[4], item[5]]
            break
          case 0x73/* s 4 params */:
            item[0] += x
            item[1] += y
            item[2] += x
            item[3] += y
            prevPos = [item[2], item[3]]
            break
          case 0x71/* q 4 params */:
            item[0] += x
            item[1] += y
            item[2] += x
            item[3] += y
            prevPos = [item[2], item[3]]
            break
          case 0x74/* t 2 params */:
            item[0] += x
            item[1] += y
            prevPos = item
            break
          case 0x61/* a 7 params */:
            item[5] += x
            item[6] += y
            prevPos = [item[5], item[6]]
            break

          // Upper
          case 0x4D/* M 2 params */:
            prevPos = item
            break
          case 0x5A/* Z 0 params */:
            break
          case 0x4C/* L 2 params */:
            prevPos = item
            break
          case 0x48/* H 1 params */:
            prevPos = [item[0], y]
            break
          case 0x56/* V 1 params */:
            prevPos = [x, item[0]]
            break
          case 0x43/* C 6 params */:
            prevPos = [item[4], item[5]]
            break
          case 0x53/* S 4 params */:
          case 0x51/* Q 4 params */:
            prevPos = [item[2], item[3]]
            break
          case 0x54/* T 2 params */:
            prevPos = [item[0], item[1]]
            break
          case 0x41/* A 7 params */:
            prevPos = [item[5], item[6]]
            break
        }
      } else { // first M two params
        prevPos = item
      }

      return {
        type: comd,
        args: item
      }
    })

    return {
      err,
      type: 2,
      segments: transformPath(opts, this.result),
    }
  }

  // attention coordinates z|Z after uppercase
  relNormalize (opts = { round: 2 }) {
    if (opts.transform) this.unArc()
    const { err, result = [] } = this
    if (err.length) {
      this.result = []
      return
    }
    let prevPos = [0, 0] // abs coordinates
    let isClosePath = false
    this.result = result.map((item, index) => {
      let comd = item.shift()
      if (index > 0) {
        let code = comd.charCodeAt(0)

        // z|Z after uppercase
        if (!isClosePath) {
          comd = comd.toLowerCase()
        } else {
          isClosePath = false
          code |= 0x20
          prevPos = [0, 0]
        }
        const [x, y] = prevPos

        switch (code) {
          // Upper
          case 0x4D/* M 2 params */:
            prevPos = [item[0], item[1]]
            item[0] += -x
            item[1] += -y
            break
          case 0x5A/* Z 0 params */:
            isClosePath = true
            break
          case 0x4C/* L 2 params */:
            prevPos = [item[0], item[1]]
            item[0] += -x
            item[1] += -y
            break
          case 0x48/* H 1 params */:
            prevPos = [item[0], y]
            item[0] += -x
            break
          case 0x56/* V 1 params */:
            prevPos = [x, item[0]]
            item[0] += -y
            break
          case 0x43/* C 6 params */:
            prevPos = [item[4], item[5]]
            item[0] += -x
            item[1] += -y
            item[2] += -x
            item[3] += -y
            item[4] += -x
            item[5] += -y
            break
          case 0x53/* S 4 params */:
            prevPos = [item[2], item[3]]
            item[0] += -x
            item[1] += -y
            item[2] += -x
            item[3] += -y
            break
          case 0x51/* Q 4 params */:
            prevPos = [item[2], item[3]]
            item[0] += -x
            item[1] += -y
            item[2] += -x
            item[3] += -y
            break
          case 0x54/* T 2 params */:
            prevPos = [item[0], item[1]]
            item[0] += -x
            item[1] += -y
            break
          case 0x41/* A 7 params */:
            prevPos = [item[5], item[6]]
            item[5] += -x
            item[6] += -y
            break

          // lower
          case 0x6D/* m 2 params */:
            prevPos = [item[0] + x, item[1] + y]
            break
          case 0x7A/* z 0 params */:
            isClosePath = true
            break
          case 0x6C/* l 2 params */:
            prevPos = [item[0] + x, item[1] + y]
            break
          case 0x68/* h 1 params */:
            prevPos = [item[0] + x, y]
            break
          case 0x76/* v 1 params */:
            prevPos = [x, item[0] + y]
            break
          case 0x63/* c 6 params */:
            prevPos = [item[4] + x, item[5] + y]
            break
          case 0x73/* s 4 params */:
            prevPos = [item[2] + x, item[3] + y]
            break
          case 0x71/* q 4 params */:
            prevPos = [item[2] + x, item[3] + y]
            break
          case 0x74/* t 2 params */:
            prevPos = [item[0] + x, item[1] + y]
            break
          case 0x61/* a 7 params */:
            prevPos = [item[5] + x, item[6] + y]
            break
        }
      } else { // first M two params
        prevPos = item
      }

      return {
        type: comd,
        args: item
      }
    })

    return {
      err,
      type: 2,
      segments: transformPath(opts, this.result),
    }
  }


  getSegments () {
    const { err, result = [] } = this
    return {
      err,
      type: 0,
      segments: result
    }
  }
}

// white space and separators, such as ↵ ''
function isSpace (ch) {
  return (ch === 0x0A) || (ch === 0x0D) || (ch === 0x2028) || (ch === 0x2029) || // Line terminators ↵
    // White spaces
    (ch === 0x20) || (ch === 0x09) || (ch === 0x0B) || (ch === 0x0C) || (ch === 0xA0) ||
    (ch >= 0x1680 && SPECIAL_SPACES.indexOf(ch) >= 0)
}

function isCommand (code) {
  /* eslint-disable no-bitwise */
  // 按位运算  0x20; 大写转小写 按位运算，有一个为 1 就为1 ，反之为0,  code | 0x20 (M 0x4D, m 0x6D, 0x4D|0x20 === 0x6D) 还是为 十进制 code point
  switch (code | 0x20) {
    case 0x6D/* m */:
    case 0x7A/* z */:
    case 0x6C/* l */:
    case 0x68/* h */:
    case 0x76/* v */:
    case 0x63/* c */:
    case 0x73/* s */:
    case 0x71/* q */:
    case 0x74/* t */:
    case 0x61/* a */:

      return true
  }
  return false
}

function isDigit (code) {
  // unicode character for digit code point range 48 ~ 57
  return (code >= 48 && code <= 57) // 0 ~ 9
}

function isDigitStart (code) {
  // unicode code point equal hexadecimal 109 === 0x6D true
  return (code >= 48 && code <= 57) || /* 0 ~ 9 */
          code === 0x2B || /* + */
          code === 0x2D || /* - */
          code === 0x2E /* . */
}

function skipSpaces (state) {
  while (state.index < state.max && isSpace(state.path.charCodeAt(state.index))) {
    state.index++
  }
}


function scanParam (state) {
  const start = state.index
  let index = start
  const max = state.max
  let zeroFirst = false
  let hasCeiling = false
  let hasDecimal = false
  let hasDot = false
  let ch

  if (index >= max) {
    state.err = `SvgPath: missed param (at pos ${index})`
    return
  }
  ch = state.path.charCodeAt(index)

  if (ch === 0x2B/* + */ || ch === 0x2D/* - */) {
    index++
    ch = (index < max) ? state.path.charCodeAt(index) : 0
  }

  // This logic is shamelessly borrowed from Esprima
  // https://github.com/ariya/esprimas
  //
  if (!isDigit(ch) && ch !== 0x2E/* . */) {
    state.err = `SvgPath: param should start with 0..9 or \`.\` (at pos ${index})`
    return
  }

  if (ch !== 0x2E/* . */) {
    zeroFirst = (ch === 0x30/* 0 */)
    index++

    ch = (index < max) ? state.path.charCodeAt(index) : 0

    if (zeroFirst && index < max) {
      // decimal number starts with '0' such as '09' is illegal.
      if (ch && isDigit(ch)) {
        state.err = `SvgPath: numbers started with \`0\` such as \`09\` are ilegal (at pos ${start})`
        return
      }
    }

    while (index < max && isDigit(state.path.charCodeAt(index))) {
      index++
      hasCeiling = true
    }
    ch = (index < max) ? state.path.charCodeAt(index) : 0
  }

  if (ch === 0x2E/* . */) {
    hasDot = true
    index++
    while (isDigit(state.path.charCodeAt(index))) {
      index++
      hasDecimal = true
    }
    ch = (index < max) ? state.path.charCodeAt(index) : 0
  }

  // digit accuracy, such as 1.2345678901234568e+21, 3e-7
  if (ch === 0x65/* e */ || ch === 0x45/* E */) {
    if (hasDot && !hasCeiling && !hasDecimal) {
      state.err = `SvgPath: invalid float exponent (at pos ${index})`
      return
    }

    index++

    ch = (index < max) ? state.path.charCodeAt(index) : 0
    if (ch === 0x2B/* + */ || ch === 0x2D/* - */) {
      index++
    }
    if (index < max && isDigit(state.path.charCodeAt(index))) {
      while (index < max && isDigit(state.path.charCodeAt(index))) {
        index++
      }
    } else {
      state.err = `SvgPath: invalid float exponent (at pos ${index})`
      return
    }
  }

  state.index = index
  state.param = parseFloat(state.path.slice(start, index)) + 0.0
}


function finalizeSegment (state) {
  let cmd, cmdLC

  // Process duplicated commands (without comand name)

  // This logic is shamelessly borrowed from Raphael
  // https://github.com/DmitryBaranovskiy/raphael/
  //
  cmd = state.path[state.segmentStart]
  cmdLC = cmd.toLowerCase()

  let params = state.data

  if (cmdLC === 'm' && params.length > 2) {
    state.result.push([ cmd, params[0], params[1] ])
    params = params.slice(2)
    cmdLC = 'l'
    cmd = (cmd === 'm') ? 'l' : 'L'
  }

  if (cmdLC === 'r') {
    state.result.push([ cmd ].concat(params))
  } else {
    while (params.length >= paramCounts[cmdLC]) {
      state.result.push([ cmd ].concat(params.splice(0, paramCounts[cmdLC])))
      if (!paramCounts[cmdLC]) {
        break
      }
    }
  }
}


function scanSegment (state) {
  const max = state.max
  let comma_found
  let i

  state.segmentStart = state.index
  // charCodeAt 返回指定位置的字符的 Unicode 值
  const cmdCode = state.path.charCodeAt(state.index)

  // 不是绘制字母命令
  if (!isCommand(cmdCode)) {
    state.err = `SvgPath: bad command ${state.path[state.index]} (at pos ${state.index})`
    return
  }

  const need_params = paramCounts[state.path[state.index].toLowerCase()]
  // console.error("need_params", state.path[state.index].toLowerCase())
  state.index++
  skipSpaces(state)

  state.data = []

  if (!need_params) {
    // Z
    finalizeSegment(state)
    return
  }

  comma_found = false

  for (;;) {
    for (i = need_params; i > 0; i--) {
      scanParam(state)
      if (state.err.length) {
        return
      }
      state.data.push(state.param)

      skipSpaces(state)
      comma_found = false

      if (state.index < max && state.path.charCodeAt(state.index) === 0x2C/* , */) {
        state.index++
        skipSpaces(state)
        comma_found = true
      }
    }

    // after ',' param is mandatory
    if (comma_found) {
      continue
    }

    if (state.index >= state.max) {
      break
    }

    // Stop on next segment
    if (!isDigitStart(state.path.charCodeAt(state.index))) {
      break
    }
  }

  finalizeSegment(state)
}

/* Returns array of segments:
 *
 * [
 *   [ command, coord1, coord2, ... ]
 * ]
 */
function pathParse (svgPath) {
  const state = new State(svgPath)
  const max = state.max
  skipSpaces(state)

  while (state.index < max && !state.err.length) {
    scanSegment(state)
  }

  if (state.err.length) {
    state.result = []
  } else if (state.result.length) {
    if ('mM'.indexOf(state.result[0][0]) < 0) {
      state.err = 'SvgPath: string should start with `M` or `m`'
      state.result = []
    } else {
      state.result[0][0] = 'M'
    }
  }
  return state
}

/**
 * serialize Path Segments
 * @param {*} result {}
 */
function serializePath (result = {}) {
  const { err = '', type = 0, segments = [] } = result
  let data = ''
  if (segments.length === 0 || err) return data
  if (type === 0) {
    segments.map(item => {
      data += item.join(' ')
    })
  } else if (type === 1 || type === 2) {
    segments.map(item => {
      const { type, args } = item
      data += type + args.join(' ')
    })
  }
  return data
}

module.exports = {
  pathParse,
  serializePath
}
