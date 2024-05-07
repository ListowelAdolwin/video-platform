import mailer from "nodemailer";

const sendCustomEmail = (from, to, subject, emailVerifyToken) => {
	const transporter = mailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.APP_EMAIL,
			pass: process.env.APP_PASSWORD,
		},
	});
	const { CLIENT_URL } = process.env;
	const html = `<h3>Hello there friend from Listo,</h3>
  <p>
    Please confirm your email address to complete your registration and ensure you didn't enter it incorrectly.
  </p>
  <p>
    Click the link below to verify your email:
  </p>
  <a href="${CLIENT_URL}/verify-email/${emailVerifyToken}">Verify Email</a>
  <p>
    You've got this!
  </p>`;

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

export default sendCustomEmail;
