import mailer from 'nodemailer'


const sendCustomPasswordResetEmail = (from, to, subject, emailResetToken) => {
    const transporter = mailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.APP_EMAIL,
            pass: process.env.APP_PASSWORD,
        }
    })

    const html = `<h3>Hello there, please click on the link below to reset your password </br> \
    <a href="http://127.0.0.1:5173/reset-password/${emailResetToken}">Reset password</a> \
    </br> </br>\
    You've got this! </h3>`

    transporter.sendMail({
        from,
        to,
        subject,
        html
    }, (err, info) => {
        if (err) {
            console.log(`Failed to send email to ${to}`)
            console.log(err)
        } else {
            console.log(`Email sent to ${to}`)
        }
    })
}

export default sendCustomPasswordResetEmail