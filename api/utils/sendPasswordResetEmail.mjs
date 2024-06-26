import mailer from "nodemailer";

const sendCustomPasswordResetEmail = (from, to, subject, emailResetToken) => {
	const transporter = mailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.APP_EMAIL,
			pass: process.env.APP_PASSWORD,
		},
	});
	const { CLIENT_URL } = process.env;
	const html = `<h3 style="font-family: Arial, sans-serif; margin-bottom: 15px; font-size: 18px;">
            Hi there,
            </h3>
            <p style="margin-bottom: 10px;">
            We heard you need to reset your password. No worries, it happens to the best of us!
            </p>
            <p style="margin-bottom: 10px;">
            Click the link below to create a new, secure password:
            </p>
            <a href="${CLIENT_URL}/reset-password/${emailResetToken}" style="color: #337ab7; text-decoration: none; border-bottom: 1px solid #337ab7;">
            Reset Password
            </a>
            <p style="margin-top: 15px;">
            This link will expire soon, so don't wait too long!
            </p>
            `;

	transporter.sendMail(
		{
			from,
			to,
			subject,
			html,
		},
		/* eslint-disable-next-line no-unused-vars */
		(err, info) => {
			if (err) {
				console.log(`Failed to send email to ${to}`);
				console.log(err);
			} else {
				console.log(`Email sent to ${to}`);
			}
		},
	);
};

export default sendCustomPasswordResetEmail;
