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
  let tar = parseFloat(num)
  if (isNaN(tar)) { return }
  return Math.round(num * Math.pow(10, rel)) / Math.pow(10, rel)
}


module.exports = {
  unicodeToString,
  utf8ToString,
  toDecimal,
}
