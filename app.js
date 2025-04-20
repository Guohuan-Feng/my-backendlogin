const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/authRoutes')

const app = express()

// ✅ 中间件顺序不要乱
app.use(cors())                 // 允许跨域
app.use(express.json())        // ✅ 解析 JSON 请求体（替代 bodyParser）

app.use('/api/auth', authRoutes)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
})
