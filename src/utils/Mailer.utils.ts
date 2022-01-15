import User from '@/resources/user/user.interface';
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

    public async sendVerificationEmail(user: User, token: string) {
        const mailOptions: SendMailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Email verification for Wander account',
            html: `
              <h4>Hello ${user.username}</h4>
              <p>Thanks for signup with wander!</p>
              <p>Please verify your email address by clicking the link below.</p>
              <a href="${process.env.FRONTEND_URL}/verify-email/${user._id}/${token}">
                ${process.env.FRONTEND_URL}/verify-email/${user._id}/${token}
              </a>

              <p>Best Regards</p>
              <p><strong>Team Wander</strong></p>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            throw new Error('Unable to send email, try again later!');
        }
    }

    public async sendResetPasswordEmail(user: User, token: string) {
        const mailOptions: SendMailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset for Wander account',
            html: `
              <h4>Hello ${user.username}</h4>
              <p>You can reset your password by going to link below.</p>
              <a href="${process.env.FRONTEND_URL}/reset-password/${user._id}/${token}">
                ${process.env.FRONTEND_URL}/reset-password/${user._id}/${token}
              </a>

              <p>Best Regards</p>
              <p><strong>Team Wander</strong></p>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            throw new Error('Unable to send email, try again later!');
        }
    }
}

export default Mailer;
