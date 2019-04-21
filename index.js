const { pathParse, serializePath } = require('./lib/path_parse')

const pathDatas = pathParse('M10 80 c 30 -70, 55 -70, 85 0 s 55 70, 85 0').absNormalize()

console.log('pathDatas', pathDatas.segments)
console.log('pathDatas', serializePath(pathDatas))
