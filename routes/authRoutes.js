const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const authenticateToken = require('../middleware/authMiddleware')




// 注册 & 登录
router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/send-sms-code', authController.sendVerificationCode)

// Google 登录
router.get('/google/login', authController.googleOAuthRedirect)
router.get('/google/callback', authController.googleOAuthCallback)


// 更新当前用户信息（需要登录）
router.put('/update', authenticateToken, authController.updateProfile)

router.post('/send-sms', authController.sendSMSVerification)
router.post('/verify-sms', authController.verifySMSCode)
router.post('/login-sms', authController.loginWithSMS)

// 获取用户信息
router.get('/user/:email', authenticateToken, authController.getUserByEmail)


module.exports = router
