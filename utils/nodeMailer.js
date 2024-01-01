const nodemailer = require("nodemailer");

const oneTimePass = require("../utils/otp")
const session = require('express-session');


    const sendMail= async (email)=>{
      const userEmail = email
      var userOtp =  oneTimePass()
      session.otp = userOtp

    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.forwardemail.net",
        port: 465,
        secure: true,
        auth: {
            // TODO: replace `user` and `pass` values from <https://forwardemail.net>
            user: 'asiftemp381@gmail.com',
            pass: 'qprwrusulkpjcqvj'
        }
    });



    const info = await transporter.sendMail({
        from: '"Asif Muhammed Test 👻"liam.stark46@ethereal.email', // sender address
        to: userEmail, // list of receivers
        subject: "Hello ✔ ASifff", // Subject line
        text: "Hello Asiff", // plain text body
        //html: "<b>ASifffff</b>", // html body
        html: userOtp.toString(),

    })

    }

    module.exports = sendMail

    




