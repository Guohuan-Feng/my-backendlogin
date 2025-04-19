const nodemailer = require('nodemailer')

// Create a transporter using Gmail service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '2890858968a@gmail.com',
    pass: 'hhyntgkgzdrhjnxp',
  },
})

// Define the email options
const mailOptions = {
  from: '2890858968a@gmail.com',
  to: '2890858968a@gmail.com',
  subject: 'Test Email',
  text: 'This is a test email.',
}

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.log('Failed to send:', error)
  }
  console.log('Sent successfully:', info.response)
})
