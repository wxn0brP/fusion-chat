import { createTransport } from "nodemailer";
import fs from "fs";
import contents, { MailContents } from "./mail/contents";
const config = JSON.parse(fs.readFileSync("config/mailConfig.json", "utf8"));

export default (type: MailContents, to: string, ...params: any[]) => {
    try{
        const smtpTransport = createTransport(config);

        const content = contents[type];
        if(!content) return false;
        // @ts-ignore
        // TODO Fix type
        const { subject, html } = content(...params);

        const mailOptions = {
            from: config.from,
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

function wrapHtmlContent(title: string, content: string){
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