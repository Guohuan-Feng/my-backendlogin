const twilio = require('twilio')

const accountSid = 'ACd4f957e9d7af7bc2dba5b059df273de3'
const authToken = 'ab1649deb6c2e3ab4b3e8fb1b79f2a22'
const verifyServiceSid = 'VA3ee84906785ea8431566087c6001dc81'

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

module.exports = {
  sendSMSCode,
  checkSMSCode
}
