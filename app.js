const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const authRoutes = require('./routes/authRoutes')

const app = express()

// 中间件
app.use(cors()) // 允许跨域请求
app.use(bodyParser.json()) // 支持 JSON 请求体

// 路由前缀
app.use('/api/auth', authRoutes)

// 启动服务器
const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
})
