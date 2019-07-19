const { pathParse, serializePath } = require('./lib/path_parse')
const fs = require('fs')

const pathDatas = pathParse('M511.23 938.53c235.71 0 426.78 -191.04 426.79 -426.79s-191.04 -426.78 -426.79 -426.78s-426.78 191.04 -426.78 426.78s191.04 426.78 426.78 426.79zm0 -819.39c216.48 0 392.64 176.13 392.64 392.64s-176.16 392.64 -392.64 392.64s-392.64 -176.16 -392.64 -392.64s176.16 -392.64 392.64 -392.64z').absCairo({
  round: 2
})

writeToFile(pathDatas.segments, './data.json')

console.log('pathDatas', pathDatas.segments)
console.log('pathDatas', serializePath(pathDatas))

function writeToFile (data, path, calllback) {
  data = JSON.stringify(data, null, '\t')
  fs.writeFile(path, data, 'utf-8', function (err) {
    if (err) throw err
    calllback && calllback()
  })
}
