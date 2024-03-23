import mailer from 'nodemailer'


const sendCustomEmail = (from, to, subject, emailVerifyToken) => {
    const transporter = mailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.APP_EMAIL,
            pass: process.env.APP_PASSWORD,
        }
    })

    const html = `<h3>Hello there friend from Listo, please the next step after the registering is to confirm your email so we are sure you did not by mistake enter the wrong email </br> \
    Please click the link below to verify </br> \
    <a href="http://127.0.0.1:3000/verify-email/${emailVerifyToken}">verify email</a> \
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

export default sendCustomEmail