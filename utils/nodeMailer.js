const nodemailer = require("nodemailer");

const otp = require("../utils/otp")


    const sendMail= async ()=>{
      
      var   otp()

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
        to: "asifasifpsps@gmail.com", // list of receivers
        subject: "Hello ✔ ASifff", // Subject line
        text: "Hello Asiff", // plain text body
        //html: "<b>ASifffff</b>", // html body
        html: otp,

    })

    console.log("Message sent: %s", info.messageId)

    }

    module.exports = sendMail

    




