const formidable = require('formidable')
const fs = require('fs')
const path = require('path')
const fsPromises = fs.promises

const mv = async (sourcePath, destPath) => {
  try {
    // rename() 无法跨不同的挂载点进行工作，即使相同的文件系统被挂载在两个挂载点上
    return await fsPromises.rename(sourcePath, destPath)
  } catch (error) {
    if (error.code === 'EXDEV') {
      // 读取临时文件写入到新的位置，最后再删除临时文件
      const readStream = fs.createReadStream(sourcePath)
      const writeStream = fs.createWriteStream(destPath)

      return new Promise((resolve, reject) => {
        readStream.pipe(writeStream)
        readStream.on('end', async () => {
          await fsPromises.unlink(sourcePath)
          resolve()
        })
        readStream.on('error', (err) => {
          console.error(`File write failed with message: ${err.message}`);  
          writeStream.close();
          reject(err)
        })
      })
    }
  }
}

const uploadImageHandler = async (req, res) => {
  const form = new formidable.IncomingForm({ multiples: true })
  form.encoding = 'utf-8'
  form.maxFieldsSize = 1024 * 5
  form.keepExtensions = true

  try {
    const { file } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, file) => {
        if (err) {
          return reject(err)
        }
        return resolve({ fields, file })
      })
    })
    const { name: fileName, path: sourcePath } = file.file
    const destPath = path.join(__dirname, '../images', fileName)
    console.log(`sourcePath: ${sourcePath}. destPath: ${destPath}`)

    await mv(sourcePath, destPath)

    console.log(`File ${fileName} write success.`)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ code: 'SUCCESS', message: 'Upload success.'}))
  } catch (e) {
    console.error(`Move file failed with message: ${e.message}`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ code: 'ERROR', message: `${e.message}`}));
  }
}

module.exports = uploadImageHandler
