
const nodemailer = require("nodemailer");
const config = require('./config');

let testAccount;
let transporter;

(async function() {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
        host: config.NODE_MAILER.HOST,
        port: config.NODE_MAILER.PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: config.NODE_MAILER.EMAIL || testAccount.user,
            pass: config.NODE_MAILER.PASSWORD || testAccount.pass, 
        },
    });
 })()


module.exports.emailVerification = function(email, name, token) {
    const verifyLink = `${config.SERVER}/users/verify-email?token=${token}`
    const mailData = {
        from: '"Survey" mailer@survey.com',
        to: email,
        subject: "Verify your email",
        html: `<h4><b>Hi ${name}, thank you for creating an account</b> Please click below link to verify your email </h4>
            <a href="${verifyLink}" title='verification link' target='_blank'>${verifyLink}</a>
        `,
    }

    module.exports.sendMail(mailData);
}


module.exports.sendMail = async(mailData) => {
    const info = await transporter.sendMail(mailData).catch((error)=> console.error(error));
    
    console.log("Message sent: %s", info.messageId);    
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
