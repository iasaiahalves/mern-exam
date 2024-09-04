import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';

import ENV from '../config.js';

// Set up Nodemailer transport configuration
let nodeConfig = {
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: ENV.EMAIL, // generated ethereal user
        pass: ENV.PASSWORD // generated ethereal password
    }
}

let transporter = nodemailer.createTransport(nodeConfig);

let MailGenerator = new Mailgen({
    theme: "default",
    product: {
        name: "Mailgen",
        link: 'https://mailgen.js/'
    }
});

/** POST: http://localhost:8080/api/registerMail 
 * @param: {
 *  "username" : "example123",
 *  "userEmail" : "admin123",
 *  "text" : "",
 *  "subject" : "",
 * }
 */
export const registerMail = async (req, res) => {
    const { username, userEmail, text, subject } = req.body;

    // Validate input
    if (!username || !userEmail) {
        return res.status(400).send({ error: 'Username and userEmail are required.' });
    }

    // Body of the email
    var email = {
        body: {
            name: username,
            intro: text || 'Welcome to Daily Tuition! We\'re very excited to have you on board.',
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }

    var emailBody = MailGenerator.generate(email);

    let message = {
        from: ENV.EMAIL,
        to: userEmail,
        subject: subject || "Signup Successful",
        html: emailBody
    }

    try {
        await transporter.sendMail(message);
        return res.status(200).send({ msg: "You should receive an email from us." });
    } catch (error) {
        console.error('Error sending email:', error); // Log detailed error
        return res.status(500).send({ error: error.message || 'Failed to send email. Please try again later.' });
    }
    
}
