const http = require('http')

const uploadImageHandler = require('./uploadImageHandler.js')

const PORT = process.env.PORT || 3000

const server = http.createServer(async (req, res) => {
  if (req.url === '/upload/image' && req.method.toLocaleLowerCase() === 'post') {
    uploadImageHandler(req, res)
  } else {
    res.setHeader('statusCode', 404)
    res.end('Not found')
  }
})

server.listen(PORT, () => {
  console.log(`server is listening at ${server.address().port}`)
})
