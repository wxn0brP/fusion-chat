const mailer = require('nodemailer');
const cfg = require("../../config/mailConfig.json");

module.exports = (type, to, ...params) => {
    try{
        const smtpTransport = mailer.createTransport(cfg);

        let html = "";
        let subject = "";
        switch(type){
            case "register":
                subject = "Fusion Chat | Register";
                html = `
                    <h1>Register account</h1>
                    <h2>Code: ${params[0]}</h2>
                `;
            break;
            case "reset-password":
                subject = "Fusion Chat | Reset Password";
                html = `
                    <h1>Reset password</h1>
                    <h2>Code: ${params[0]}</h2>
                `;
            break;
            case "login":
                subject = "Fusion Chat | Account Login Alert";
                html = `
                    <h1>Login Alert</h1>
                    <p>Hello ${params[0]},</p>
                    <p>We detected a login to your account from the following device: ${params[1]}</p>
                    <p>If this was you, you can ignore this message. If you didn't log in, please change your password immediately.</p>
                    <p>Thank you. Fusion Chat Team.</p>
                `;
            break;
            default:
                return false;
        }

        const mailOptions = {
            from: cfg.from,
            to,
            subject,
            html: wrapHtmlContent(subject, html).trim()
        };

        smtpTransport.sendMail(mailOptions, function(err, res){
            smtpTransport.close();
            if(err){
                console.error(err);
            }else{
                console.log("E-mail Sent", to);
            }
        });
    }catch(error){
        console.error(error);
        return false;
    }
    return true;
}

function wrapHtmlContent(title, content){
    return `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>${title}</title>
            </head>
            <body>
                ${content}
            </body>
        </html>
    `;
}