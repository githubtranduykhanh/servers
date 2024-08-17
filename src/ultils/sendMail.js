const nodemailer = require('nodemailer')
const asyncHandler = require('express-async-handler')
require('dotenv').config()

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_NAME, // generated ethereal user
        pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
    },
});


const sendMail = asyncHandler(async (email, html, subject ) => {
    // send mail with defined transport object
    return info = await transporter.sendMail({
        from: '"Event Hub" <no-relply@ecommercelocalbrand.com>', // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        html: html, // html body
    })
})

module.exports = sendMail