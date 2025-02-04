import { createTransport } from "nodemailer";
import fs from "fs";
import contents from "./mail/contents.js";
const config = JSON.parse(fs.readFileSync("config/mailConfig.json", "utf8"));
export default (type, to, ...params) => {
    try {
        const smtpTransport = createTransport(config);
        const content = contents[type];
        if (!content)
            return false;
        const { subject, html } = content(...params);
        const mailOptions = {
            from: config.from,
            to,
            subject,
            html: wrapHtmlContent(subject, html).trim()
        };
        smtpTransport.sendMail(mailOptions, function (err, res) {
            smtpTransport.close();
            if (err) {
                console.error(err);
            }
            else {
                console.log("E-mail Sent", to);
            }
        });
    }
    catch (error) {
        console.error(error);
        return false;
    }
    return true;
};
function wrapHtmlContent(title, content) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2JhY2svbG9naWMvbWFpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQzdDLE9BQU8sRUFBRSxNQUFNLElBQUksQ0FBQztBQUNwQixPQUFPLFFBQTBCLE1BQU0saUJBQWlCLENBQUM7QUFDekQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLHdCQUF3QixFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFFN0UsZUFBZSxDQUFDLElBQWtCLEVBQUUsRUFBVSxFQUFFLEdBQUcsTUFBYSxFQUFFLEVBQUU7SUFDaEUsSUFBRyxDQUFDO1FBQ0EsTUFBTSxhQUFhLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRTlDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQixJQUFHLENBQUMsT0FBTztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBRzFCLE1BQU0sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUM7UUFFN0MsTUFBTSxXQUFXLEdBQUc7WUFDaEIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO1lBQ2pCLEVBQUU7WUFDRixPQUFPO1lBQ1AsSUFBSSxFQUFFLGVBQWUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFO1NBQzlDLENBQUM7UUFFRixhQUFhLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxVQUFTLEdBQUcsRUFBRSxHQUFHO1lBQ2pELGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN0QixJQUFHLEdBQUcsRUFBQyxDQUFDO2dCQUNKLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdkIsQ0FBQztpQkFBSSxDQUFDO2dCQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ25DLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFBQSxPQUFNLEtBQUssRUFBQyxDQUFDO1FBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNyQixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDaEIsQ0FBQyxDQUFBO0FBRUQsU0FBUyxlQUFlLENBQUMsS0FBYSxFQUFFLE9BQWU7SUFDbkQsT0FBTzs7Ozs7eUJBS2MsS0FBSzs7O2tCQUdaLE9BQU87OztLQUdwQixDQUFDO0FBQ04sQ0FBQyJ9