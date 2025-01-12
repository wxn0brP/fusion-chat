# Mail Configuration

The `config/mailConfig.json` file is used to configure the email settings for Fusion Chat. This configuration is based on [Node mailer](https://www.npmjs.com/package/nodemailer) and includes an additional `from` field to specify the sender's email address.

## Example Configuration

Below is an example of the `config/mailConfig.json` file:

```json
{
  "host": "smtp.example.com",
  "port": 587,
  "secure": false,
  "auth": {
    "user": "your-email@example.com",
    "pass": "your-email-password"
  },
  "from": "no-reply@example.com"
}
```