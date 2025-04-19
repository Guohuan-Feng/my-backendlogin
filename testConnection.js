const pool = require('./db')

async function test () {
  try {
    const result = await pool.query('SELECT NOW()')
    console.log('✅ Connected to Neon:', result.rows[0])
  } catch (err) {
    console.error('❌ Connection failed:', err)
  }
}

test()
