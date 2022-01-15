import nodemailer, { SendMailOptions, Transporter } from 'nodemailer';

class Mailer {
    private transporter: Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    public async sendVerificationEmail(
        email: string,
        username: string,
        verifyToken: string
    ) {
        const mailOptions: SendMailOptions = {
            from: 'no-reply@gmail.com',
            to: email,
            subject: 'Email verification for Wander account',
            html: `
              <h4>Hello ${username}</h4>
              <p>Thanks for signup with wander!</p>
              <p>Please verify your email address by clicking the link below.</p>
              <a href="${process.env.FRONTEND_URL}/verify-email/${verifyToken}">
                ${process.env.FRONTEND_URL}/verify-email/${verifyToken}
              </a>

              <p>Best Regards</p>
              <p><strong>Team Wander</strong></p>
            `,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log(info);
        } catch (error) {
            console.log(error);
            throw new Error('Unable to send email, try again later!');
        }
    }
}

export default Mailer;
