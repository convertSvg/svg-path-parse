'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var sqrt = Math.sqrt, cos = Math.cos, sin = Math.sin, tan = Math.tan, atan = Math.atan, PI = Math.PI;
/**
 * @name degToRad 度数转弧度
 * @param angle
 */
var degToRad = function (angle) {
    return angle * PI / 180;
};
/**
 * @name gradToRad 梯度(Gradians)转弧度
 * @param grad  90deg = 100grad = 0.25turn ≈ 1.570796326794897rad
 */
var gradToRad = function (grad) {
    return grad / 200 * PI;
};
/**
 * @name turnToRad 转、圈（Turns）转弧度
 * @param turn 90deg = 100grad = 0.25turn ≈ 1.570796326794897rad
 */
var turnToRad = function (turn) {
    return turn * 2 * PI;
};
/**
 * @name toRad 转为弧度
 * @param deg
 */
var toRad = function (deg) {
    deg = String(deg);
    var value = parseFloat(deg);
    var unit = deg.toLowerCase().replace("" + value, '');
    switch (unit) {
        case 'grad':
            return gradToRad(value);
        case 'turn':
            return turnToRad(value);
        case 'rad': // 弧度值
            return value;
        case 'deg':
        default:
            return degToRad(value);
    }
};

// a	c	e           a	c	e       1	0	0
var Matrix = [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
];
/**
 * combine 2 matrixes 行x列
 * @param m1  [a, c, e, b, d, f, 0, 0, 1]
 * @param m2  [a, c, e, b, d, f, 0, 0, 1]
 */
function combine() {
    var arg = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        arg[_i] = arguments[_i];
    }
    var args = [].slice.call(arguments) || [];
    var m1 = args[0] || Matrix;
    args.map(function (m2, idx) {
        if (idx >= 1) {
            m1 = [
                m1[0] * m2[0] + m1[1] * m2[3] + m1[2] * m2[6], m1[0] * m2[1] + m1[1] * m2[4] + m1[2] * m2[7], m1[0] * m2[2] + m1[1] * m2[5] + m1[2] * m2[8],
                m1[3] * m2[0] + m1[4] * m2[3] + m1[5] * m2[6], m1[3] * m2[1] + m1[4] * m2[4] + m1[5] * m2[7], m1[3] * m2[2] + m1[4] * m2[5] + m1[5] * m2[8],
                m1[6] * m2[0] + m1[7] * m2[3] + m1[8] * m2[6], m1[6] * m2[1] + m1[7] * m2[4] + m1[8] * m2[7], m1[6] * m2[2] + m1[7] * m2[5] + m1[8] * m2[8]
            ];
        }
    });
    return m1;
}
var translate = function (x, y) {
    if (y === void 0) { y = x; }
    return [
        1, 0, x,
        0, 1, y,
        0, 0, 1
    ];
};
var translateX = function (x) {
    return [
        1, 0, x,
        0, 1, 0,
        0, 0, 1
    ];
};
var translateY = function (y) {
    return [
        1, 0, 0,
        0, 1, y,
        0, 0, 1
    ];
};
var skew = function (α, β) {
    if (β === void 0) { β = α; }
    α = toRad(α);
    β = toRad(β);
    return [
        1, tan(α), 0,
        tan(β), 1, 0,
        0, 0, 1
    ];
};
var skewX = function (α) {
    α = toRad(α);
    return [
        1, tan(α), 0,
        0, 1, 0,
        0, 0, 1
    ];
};
var skewY = function (β) {
    β = toRad(β);
    return [
        1, 0, 0,
        tan(β), 1, 0,
        0, 0, 1
    ];
};
var scale = function (scalex, scaley) {
    if (scaley === void 0) { scaley = scalex; }
    return [
        scalex, 0, 0,
        0, scaley, 0,
        0, 0, 1
    ];
};
var scaleX = function (scalex) {
    return [
        scalex, 0, 0,
        0, 1, 0,
        0, 0, 1
    ];
};
var scaleY = function (scaley) {
    return [
        1, 0, 0,
        0, scaley, 0,
        0, 0, 1
    ];
};
// https://www.w3.org/TR/SVG/coords.html#TransformProperty  rotate(angle, cx, cy)
var rotate = function (deg, cx, cy) {
    if (cx === void 0) { cx = 0; }
    if (cy === void 0) { cy = cx; }
    if (deg !== 0) {
        var α = toRad(deg);
        var m1 = translate(cx, cy);
        var m2 = [
            cos(α), -sin(α), 0,
            sin(α), cos(α), 0,
            0, 0, 1
        ];
        var m3 = translate(-cx, -cy);
        return combine(m1, m2, m3);
    }
    else {
        return Matrix;
    }
};
/**
 * getCoordinateTransform 坐标变换
 * @param x
 * @param y
 * @param m
 */
var getCoordinateTransform = function (x, y, m) {
    // m * [x,y,1]
    return {
        x: m[0] * x + m[1] * y + m[2],
        y: m[3] * x + m[4] * y + m[5]
    };
};
/**
 * getStyleMatrix2d 矩阵转换 css matrix
 * @param m  [a, c, e, b, d, f, 0, 0, 1]  => [a, b, c, d, e, f]
 */
var getStyleMatrix2d = function (m) {
    if (m === void 0) { m = Matrix; }
    // m * [x,y,1]
    return [
        m[0], m[3], m[1],
        m[4], m[2], m[5]
    ].join(',');
};

var matrix = /*#__PURE__*/Object.freeze({
  translate: translate,
  translateX: translateX,
  translateY: translateY,
  skew: skew,
  skewX: skewX,
  skewY: skewY,
  scale: scale,
  scaleX: scaleX,
  scaleY: scaleY,
  rotate: rotate,
  getCoordinateTransform: getCoordinateTransform,
  getStyleMatrix2d: getStyleMatrix2d,
  combine: combine
});

// https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix3d
var Matrix3d = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
];
/**
 * combine 2 matrixes 行x列
 * @param m1  [a, c, 0, tx, b, d, 0, ty, 0, 0, 1, tz, 0, 0, 0, 1]
 * @param m2  [a, c, 0, tx, b, d, 0, ty, 0, 0, 1, tz, 0, 0, 0, 1]
 */
function combine3d() {
    var arg = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        arg[_i] = arguments[_i];
    }
    var args = [].slice.call(arguments) || [];
    var m1 = args[0] || Matrix3d;
    args.map(function (m2, idx) {
        if (idx >= 1) {
            m1 = [
                m1[0] * m2[0] + m1[1] * m2[4] + m1[2] * m2[8] + m1[3] * m2[12], m1[0] * m2[1] + m1[1] * m2[5] + m1[2] * m2[9] + m1[3] * m2[13], m1[0] * m2[2] + m1[1] * m2[6] + m1[2] * m2[10] + m1[3] * m2[14], m1[0] * m2[3] + m1[1] * m2[7] + m1[2] * m2[11] + m1[3] * m2[15],
                m1[4] * m2[0] + m1[5] * m2[4] + m1[6] * m2[8] + m1[7] * m2[12], m1[4] * m2[1] + m1[5] * m2[5] + m1[6] * m2[9] + m1[7] * m2[13], m1[4] * m2[2] + m1[5] * m2[6] + m1[6] * m2[10] + m1[7] * m2[14], m1[4] * m2[3] + m1[5] * m2[7] + m1[6] * m2[11] + m1[7] * m2[15],
                m1[8] * m2[0] + m1[9] * m2[4] + m1[10] * m2[8] + m1[11] * m2[12], m1[8] * m2[1] + m1[9] * m2[5] + m1[10] * m2[9] + m1[11] * m2[13], m1[8] * m2[2] + m1[9] * m2[6] + m1[10] * m2[10] + m1[11] * m2[14], m1[8] * m2[3] + m1[9] * m2[7] + m1[10] * m2[11] + m1[11] * m2[15],
                m1[12] * m2[0] + m1[13] * m2[4] + m1[14] * m2[8] + m1[15] * m2[12], m1[12] * m2[1] + m1[13] * m2[5] + m1[14] * m2[9] + m1[15] * m2[13], m1[12] * m2[2] + m1[13] * m2[6] + m1[14] * m2[10] + m1[15] * m2[14], m1[12] * m2[3] + m1[13] * m2[7] + m1[14] * m2[11] + m1[15] * m2[15]
            ];
        }
    });
    return m1;
}
var translate$1 = function (x, y) {
    if (y === void 0) { y = x; }
    return [
        1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
};
var translate3d = function (x, y, z) {
    if (x === void 0) { x = 0; }
    if (y === void 0) { y = 0; }
    if (z === void 0) { z = 0; }
    return [
        1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, z,
        0, 0, 0, 1
    ];
};
var translateX$1 = function (x) {
    return [
        1, 0, 0, x,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
};
var translateY$1 = function (y) {
    return [
        1, 0, 0, 0,
        0, 1, 0, y,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
};
var translateZ = function (z) {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, z,
        0, 0, 0, 1
    ];
};
// skew() CSS defines a transformation that skews an element on the 2D plane
var skew$1 = function (α, β) {
    if (β === void 0) { β = α; }
    α = toRad(α);
    β = toRad(β);
    return [
        1, tan(α), 0, 0,
        tan(β), 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
};
var skewX$1 = function (α) {
    α = toRad(α);
    return [
        1, tan(α), 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
};
var skewY$1 = function (β) {
    β = toRad(β);
    return [
        1, 0, 0, 0,
        tan(β), 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
};
var scale$1 = function (scalex, scaley) {
    if (scaley === void 0) { scaley = scalex; }
    return [
        scalex, 0, 0, 0,
        0, scaley, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
};
var scale3d = function (scalex, scaley, scalez) {
    if (scalex === void 0) { scalex = 1; }
    if (scaley === void 0) { scaley = 1; }
    if (scalez === void 0) { scalez = 1; }
    return [
        scalex, 0, 0, 0,
        0, scaley, 0, 0,
        0, 0, scalez, 0,
        0, 0, 0, 1
    ];
};
var scaleX$1 = function (scalex) {
    return [
        scalex, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
};
var scaleY$1 = function (scaley) {
    return [
        1, 0, 0, 0,
        0, scaley, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
};
var scaleZ = function (scalez) {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, scalez, 0,
        0, 0, 0, 1
    ];
};
// https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-function/rotate3d
var rotate$1 = function (deg, cx, cy) {
    if (cx === void 0) { cx = 0; }
    if (cy === void 0) { cy = cx; }
    if (deg !== 0) {
        var α = toRad(deg);
        var m1 = translate$1(cx, cy);
        var m2 = [
            cos(α), -sin(α), 0, 0,
            sin(α), cos(α), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
        var m3 = translate$1(-cx, -cy);
        return combine3d(m1, m2, m3);
    }
    else {
        return Matrix3d;
    }
};
/**
 * rotate3d
 * @param x <number> 0 ~ 1
 * @param y <number> 0 ~ 1
 * @param z <number> 0 ~ 1
 * @param deg <angle>
 * 幂运算符（**）ECMAScript 2016 (ES 7) 新特性
 * rotate3d转换逻辑见 https://drafts.csswg.org/css-transforms-2/#Rotate3dDefined
 */
var rotate3d = function (x, y, z, deg) {
    // const rad = toRad(deg)
    var radZ = -atan(y / x);
    var radY = -atan(sqrt(x * x + y * y) / z);
    return combine3d(rotateZ(-radZ + 'rad'), rotateY(-radY + 'rad'), rotateZ(deg), rotateY(radY + 'rad'), rotateZ(radZ + 'rad'));
};
var rotateX = function (deg) {
    var α = toRad(deg);
    return [
        1, 0, 0, 0,
        0, cos(α), -sin(α), 0,
        0, sin(α), cos(α), 0,
        0, 0, 0, 1
    ];
};
var rotateY = function (deg) {
    var α = toRad(deg);
    return [
        cos(α), 0, sin(α), 0,
        0, 1, 0, 0,
        -sin(α), 0, cos(α), 0,
        0, 0, 0, 1
    ];
};
var rotateZ = function (deg) {
    var α = toRad(deg);
    return [
        cos(α), -sin(α), 0, 0,
        sin(α), cos(α), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
};
/**
 * getCoordinateTransform 坐标变换
 * @param x
 * @param y
 * @param m
 */
var getCoordinateTransform$1 = function (x, y, m) {
    // m * [x,y,1,1]
    return {
        x: m[0] * x + m[1] * y + m[3],
        y: m[4] * x + m[5] * y + m[7]
    };
};
/**
 * getStyleMatrix2d 矩阵转换 css matrix
 * @param m  [a1, a2, a3, a4, b1, b2, b3, b4, c1, c2, c3, c4, d1, d2, d3, d4]  => (a1, b1, c1, d1, a2, b2, c2, d2, a3, b3, c3, d3, a4, b4, c4, d4)
 */
var getStyleMatrix3d = function (m) {
    if (m === void 0) { m = Matrix3d; }
    return [
        m[0], m[4], m[8], m[12],
        m[1], m[5], m[9], m[13],
        m[2], m[6], m[10], m[14],
        m[3], m[7], m[11], m[15]
    ].join(',');
};

var matrix3d = /*#__PURE__*/Object.freeze({
  translate: translate$1,
  translate3d: translate3d,
  translateX: translateX$1,
  translateY: translateY$1,
  translateZ: translateZ,
  skew: skew$1,
  skewX: skewX$1,
  skewY: skewY$1,
  scale: scale$1,
  scale3d: scale3d,
  scaleX: scaleX$1,
  scaleY: scaleY$1,
  scaleZ: scaleZ,
  rotate: rotate$1,
  rotate3d: rotate3d,
  rotateX: rotateX,
  rotateY: rotateY,
  rotateZ: rotateZ,
  getCoordinateTransform: getCoordinateTransform$1,
  getStyleMatrix3d: getStyleMatrix3d,
  combine3d: combine3d
});

exports.matrix = matrix;
exports.matrix3d = matrix3d;
//# sourceMappingURL=index.js.map
