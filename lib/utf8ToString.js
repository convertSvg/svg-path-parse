/**
 * utf-8 转十进制字符串
 * @param {*} code 十六进制
 * utf-8 编码格式 如 0x2001  unicode 编码格式 \u2001
 */
function utf8ToString (code) {
  return String.fromCharCode(parseInt(code, 16))
}
