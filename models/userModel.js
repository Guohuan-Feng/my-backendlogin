const pool = require('../db')

// Create user with email and password
const createUser = async ({ email, passwordHash }) => {
  const result = await pool.query(
    `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *`,
    [email, passwordHash]
  )

  return result.rows[0]
}

// Create user with phone number only
const createUserByPhone = async ({ phone }) => {
  const result = await pool.query(
    `INSERT INTO users (phone) VALUES ($1) RETURNING *`,
    [phone]
  )

  return result.rows[0]
}

// Get user by email
const getUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  )
  return result.rows[0]
}

// Get user by phone number
const getUserByPhone = async (phone) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE phone = $1`,
    [phone]
  )
  return result.rows[0]
}

// Update user profile by email
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
  const result = await pool.query(
    `UPDATE users SET
      username = $1,
      first_name = $2,
      last_name = $3,
      age = $4,
      birthday = $5,
      address = $6,
      city = $7,
      state = $8,
      country = $9,
      postal_code = $10
     WHERE email = $11`,
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

  return result.rowCount > 0
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserByPhone,
  updateUserByEmail,
  createUserByPhone
}
