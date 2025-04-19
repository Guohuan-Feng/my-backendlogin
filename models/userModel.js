const pool = require('../db')

const createUser = async ({ email, passwordHash }) => {
  const [result] = await pool.query(
    `INSERT INTO users (email, password_hash) VALUES (?,?)`,
    [email, passwordHash]
  )

  const [rows] = await pool.query(
    `SELECT * FROM users WHERE id = ?`,
    [result.insertId]
  )

  return rows[0]
}


const createUserByPhone = async ({ phone }) => {
  const [result] = await pool.query(
    `INSERT INTO users (phone) VALUES (?)`,
    [phone]
  )

  const [rows] = await pool.query(
    `SELECT * FROM users WHERE id = ?`,
    [result.insertId]
  )

  return rows[0]
}



// 通过邮箱获取用户
const getUserByEmail = async (email) => {
  const [rows] = await pool.query(
    `SELECT * FROM users WHERE email = ?`,
    [email]
  )
  return rows[0]
}

const getUserByPhone = async (phone) => {
  const [rows] = await pool.query(
    `SELECT * FROM users WHERE phone = ?`,
    [phone]
  )
  return rows[0]
}


// 更新用户信息（通过邮箱）
const updateUserByEmail = async (
  email,
  {
    username,
    first_name,
    last_name,
    age,
    birthday,
    address,
    city,
    state,
    country,
    postal_code
  }
) => {
  const [result] = await pool.query(
    `UPDATE users SET
      username = ?,
      first_name = ?,
      last_name = ?,
      age = ?,
      birthday = ?,
      address = ?,
      city = ?,
      state = ?,
      country = ?,
      postal_code = ?
     WHERE email = ?`,
    [
      username,
      first_name,
      last_name,
      age,
      birthday,
      address,
      city,
      state,
      country,
      postal_code,
      email
    ]
  )

  return result.affectedRows > 0
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserByPhone,
  updateUserByEmail,
  createUserByPhone
}
