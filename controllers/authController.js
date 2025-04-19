const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const axios = require('axios')
const User = require('../models/userModel')
const nodemailer = require('nodemailer')
const { sendSMSCode, checkSMSCode } = require('../services/twilioService') // Import Twilio service

const JWT_SECRET = 'csi4999-node-secret'
const GOOGLE_CLIENT_ID = '802652951111-6oah8b5iglq92vd3h7snd8346i06b1tf.apps.googleusercontent.com'
const GOOGLE_CLIENT_SECRET = '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'
const REDIRECT_URI = 'https://my-backendlogin.onrender.com/api/auth/google/callback'
const VERIFICATION_CODE_EXPIRE_MINUTES = 5
const verificationCodes = new Map()

const googleOAuthRedirect = (req, res) => {
  const authURL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code&scope=openid%20email%20profile`
  res.redirect(authURL)
}

const googleOAuthCallback = async (req, res) => {
  const { code } = req.query
  try {
    // Exchange code for token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    })

    const { id_token } = tokenResponse.data

    // Decode ID token (without verification)
    const payload = JSON.parse(Buffer.from(id_token.split('.')[1], 'base64').toString())
    const email = payload.email

    let user = await User.getUserByEmail(email)
    if (!user) {
      user = await User.createUser({
        email,
        passwordHash: '',
        name: payload.name || '',
        age: 0,
        avatar: payload.picture || '',
        birthday: null,
        position: '',
        createAt: new Date(),
      })
    }

    const appToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' })
    res.redirect(`http://localhost:3000/aac/?token=${appToken}`)
  } catch (err) {
    console.error(err)
    res.status(401).json({ error: 'Google OAuth failed' })
  }
}

const sendVerificationCode = async (req, res) => {
  const { email } = req.body
  const code = Math.floor(100000 + Math.random() * 900000).toString()

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: '2890858968a@gmail.com',
      pass: 'hhyntgkgzdrhjnxp',
    },
  })

  const mailOptions = {
    from: '2890858968a@gmail.com',
    to: email,
    subject: 'Your Verification Code',
    text: `Your verification code is: ${code}`,
  }

  try {
    await transporter.sendMail(mailOptions)
    verificationCodes.set(email, {
      code,
      expiresAt: Date.now() + VERIFICATION_CODE_EXPIRE_MINUTES * 60 * 1000,
    })
    res.json({ message: 'Verification code sent.' })
  } catch (err) {
    if (err.response) {
      console.error('🔥 Gmail response error:', err.response.data)
      console.error('📦 Status:', err.response.status)
      console.error('📩 Headers:', err.response.headers)
    } else if (err.request) {
      console.error('📡 Request sent but no response:', err.request)
    } else {
      console.error('❌ Request error:', err.message)
    }
    res.status(401).json({ error: 'Email verification failed' })
  }
}

const register = async (req, res) => {
  try {
    const { email, password, confirmPassword, code } = req.body

    // Verify email code
    const record = verificationCodes.get(email)
    if (!record || record.code !== code || Date.now() > record.expiresAt) {
      return res.status(400).json({ error: 'Invalid or expired verification code' })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const newUser = await User.createUser({ email, passwordHash })

    verificationCodes.delete(email) // Remove used code
    res.status(201).json({ message: 'User registered successfully', user: newUser })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.getUserByEmail(email)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' })
    res.json({ token })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const sendSMSVerification = async (req, res) => {
  const { phone } = req.body
  try {
    await sendSMSCode(phone)
    res.status(200).json({ message: 'Verification code sent via SMS' })
  } catch (err) {
    console.error('📲 Twilio sending error:', err.message)
    res.status(500).json({ error: 'Failed to send SMS' })
  }
}

const verifySMSCode = async (req, res) => {
  const { phone, code } = req.body
  try {
    const result = await checkSMSCode(phone, code)

    if (result.status !== 'approved') {
      return res.status(400).json({ error: 'Invalid or expired verification code' })
    }

    let user = await User.getUserByPhone(phone)
    if (!user) {
      user = await User.createUser({ phone, passwordHash: '' }) // No password initially
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' })
    res.json({ message: 'Verification successful', token })
  } catch (err) {
    console.error('📲 Verification failed:', err.message)
    res.status(500).json({ error: 'SMS verification failed' })
  }
}

const updateProfile = async (req, res) => {
  const {
    email,
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
  } = req.body

  try {
    const user = await User.getUserByEmail(email)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    await User.updateUserByEmail(email, {
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
    })

    res.json({ success: true })
  } catch (err) {
    console.error('Update error:', err)
    res.status(500).json({ error: 'Failed to update profile' })
  }
}

module.exports = {
  register,
  login,
  sendVerificationCode,
  googleOAuthRedirect,
  googleOAuthCallback,
  updateProfile,
  sendSMSVerification,
  verifySMSCode
}
