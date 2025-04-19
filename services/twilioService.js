require('dotenv').config()
const twilio = require('twilio')

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const verifyServiceSid = process.env.TWILIO_SERVICE_SID

const client = twilio(accountSid, authToken)

const sendSMSCode = async (phoneNumber) => {
  return await client.verify.v2.services(verifyServiceSid)
    .verifications
    .create({ to: phoneNumber, channel: 'sms' })
}

const checkSMSCode = async (phoneNumber, code) => {
  return await client.verify.v2.services(verifyServiceSid)
    .verificationChecks
    .create({ to: phoneNumber, code })
}

console.log('🔐 TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN)


module.exports = {
  sendSMSCode,
  checkSMSCode
}
