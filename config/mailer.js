
const nodemailer = require("nodemailer");
const config = require('./config');

let testAccount;
let transporter;

(async function() {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    // testAccount = await nodemailer.createTestAccount();
    // console.log(testAccount)
    transporter = await nodemailer.createTransport({
        host: config.NODE_MAILER.HOST,
        port: config.NODE_MAILER.PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: config.NODE_MAILER.EMAIL || testAccount.user,
            pass: config.NODE_MAILER.PASSWORD || testAccount.pass, 
        },
    });

    // module.exports.emailVerification("deepak@gmail.com", "Deepak", "xyz")
 })()


module.exports.emailVerification = function(email, name, token) {
    const verifyLink = `${config.FRONTEND}/verify-email?token=${token}`
    const mailData = {
        from: '"Survey" mailer@survey.com',
        to: email,
        subject: "Verify your email",
        html: `<!DOCTYPE html>

        <html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
        <head>
        <title></title>
        <meta charset="utf-8"/>
        <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
        <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
        <style>
                * {
                    box-sizing: border-box;
                }
        
                body {
                    margin: 0;
                    padding: 0;
                }
        
                a[x-apple-data-detectors] {
                    color: inherit !important;
                    text-decoration: inherit !important;
                }
        
                #MessageViewBody a {
                    color: inherit;
                    text-decoration: none;
                }
        
                p {
                    line-height: inherit
                }
        
                @media (max-width:520px) {
                    .icons-inner {
                        text-align: center;
                    }
        
                    .icons-inner td {
                        margin: 0 auto;
                    }
        
                    .row-content {
                        width: 100% !important;
                    }
        
                    .stack .column {
                        width: 100%;
                        display: block;
                    }
                }
            </style>
        </head>
        <body style="background-color: #FFFFFF; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
        <table border="0" cellpadding="0" cellspacing="0" class="nl-container" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #FFFFFF;" width="100%">
        <tbody>
        <tr>
        <td>
        <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
        <tbody>
        <tr>
        <td>
        <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 500px;" width="500">
        <tbody>
        <tr>
        <td class="column" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
        <table border="0" cellpadding="0" cellspacing="0" class="image_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
        <tr>
        <td style="width:100%;padding-right:0px;padding-left:0px;">
        <div align="center" style="line-height:10px"><img src="${config.SERVER}/images/gravity.png" style="display: block; height: auto; border: 0; width: 100px; max-width: 100%;" width="100"/></div>
        </td>
        </tr>
        </table>
        <table border="0" cellpadding="0" cellspacing="0" class="heading_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
        <tr>
        <td style="width:100%;text-align:center;">
        <h1 style="margin: 0; color: #6d6666; font-size: 28px; font-family: 'Roboto', Tahoma, Verdana, Segoe, sans-serif; line-height: 150%; text-align: center; direction: ltr; font-weight: normal; letter-spacing: 1px; margin-top: 0; margin-bottom: 0;"><strong>Survey Gravity</strong></h1>
        </td>
        </tr>
        </table>
        <table border="0" cellpadding="10" cellspacing="0" class="divider_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
        <tr>
        <td>
        <div align="center">
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
        <tr>
        <td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 3px dashed #BBBBBB;"><span> </span></td>
        </tr>
        </table>
        </div>
        </td>
        </tr>
        </table>
        <table border="0" cellpadding="10" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
        <tr>
        <td>
        <div style="font-family: sans-serif">
        <div style="font-size: 12px; mso-line-height-alt: 14.399999999999999px; color: #555555; line-height: 1.2; font-family: Arial, Helvetica Neue, Helvetica, sans-serif;">
        <p style="margin: 0; font-size: 18px; letter-spacing: normal;"><span style="font-size:18px;"><strong>Hi ${name}</strong>,</span></p>
        <p style="margin: 0; font-size: 18px; letter-spacing: normal; mso-line-height-alt: 14.399999999999999px;"> </p>
        <p style="margin: 0; font-size: 18px; letter-spacing: normal;"><span style="font-size:18px;">Thanks for getting started with <strong>Survey Gravity!</strong></span></p>
        <p style="margin: 0; font-size: 18px; letter-spacing: normal; mso-line-height-alt: 14.399999999999999px;"> </p>
        <p style="margin: 0; font-size: 18px; letter-spacing: normal;"><span style="font-size:18px;">We need a little more information to complete your registration, including a confirmation of your email address. </span></p>
        <p style="margin: 0; font-size: 18px; letter-spacing: normal; mso-line-height-alt: 14.399999999999999px;"> </p>
        <p style="margin: 0; font-size: 18px; letter-spacing: normal;"><span style="font-size:18px;">Click below to confirm your email address:</span></p>
        <p style="margin: 0; font-size: 18px; letter-spacing: normal; mso-line-height-alt: 14.399999999999999px;"> </p>
        <p style="margin: 0; font-size: 18px; letter-spacing: normal;"><span style="font-size:18px;"><span><a href='${verifyLink}' target="_blank" title="confirm email">${verifyLink}</a></span></p>
        <p style="margin: 0; font-size: 18px; letter-spacing: normal; mso-line-height-alt: 14.399999999999999px;"> </p>
        <p style="margin: 0; font-size: 18px; letter-spacing: normal;"><span style="font-size:18px;">If you have problems, please paste the above URL into your web browser.</span></p>
        <p style="margin: 0; font-size: 18px; letter-spacing: normal; mso-line-height-alt: 14.399999999999999px;"> </p>
        <p style="margin: 0; font-size: 18px; letter-spacing: normal;"><span style="font-size:18px;">We&#8217;re glad you&#8217;re here!<br/><strong>The Survey Gravity team</strong></span></p>
        </div>
        </div>
        </td>
        </tr>
        </table>
        </td>
        </tr>
        </tbody>
        </table>
        </td>
        </tr>
        </tbody>
        </table>
        <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
        <tbody>
        <tr>
        <td>
        <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 500px;" width="500">
        <tbody>
        <tr>
        <td class="column" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
        <table border="0" cellpadding="0" cellspacing="0" class="icons_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
        <tr>
        <td style="color:#9d9d9d;font-family:inherit;font-size:15px;padding-bottom:5px;padding-top:5px;text-align:center;">
        <table cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
        <tr>
        <td style="text-align:center;">
        <!--[if vml]><table align="left" cellpadding="0" cellspacing="0" role="presentation" style="display:inline-block;padding-left:0px;padding-right:0px;mso-table-lspace: 0pt;mso-table-rspace: 0pt;"><![endif]-->
        <!--[if !vml]><!-->
        <table cellpadding="0" cellspacing="0" class="icons-inner" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block; margin-right: -4px; padding-left: 0px; padding-right: 0px;">
        <!--<![endif]-->
        <tr>
        <td style="text-align:center;padding-top:5px;padding-bottom:5px;padding-left:5px;padding-right:6px;"><a href="https://www.designedwithbee.com/"><img align="center" alt="Designed with BEE" class="icon" height="32" src="${config.SERVER}/images/bee.png" style="display: block; height: auto; border: 0;" width="34"/></a></td>
        <td style="font-family:Arial, Helvetica Neue, Helvetica, sans-serif;font-size:15px;color:#9d9d9d;vertical-align:middle;letter-spacing:undefined;text-align:center;"><a href="https://www.designedwithbee.com/" style="color:#9d9d9d;text-decoration:none;">Designed with BEE</a></td>
        </tr>
        </table>
        </td>
        </tr>
        </table>
        </td>
        </tr>
        </table>
        </td>
        </tr>
        </tbody>
        </table>
        </td>
        </tr>
        </tbody>
        </table>
        </td>
        </tr>
        </tbody>
        </table><!-- End -->
        </body>
        </html>`,
    }

    module.exports.sendMail(mailData);
}


module.exports.sendMail = async(mailData) => {
    const info = await transporter.sendMail(mailData).catch((error)=> console.error(error));
    
    console.log("Message sent: %s", info.messageId);    
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
