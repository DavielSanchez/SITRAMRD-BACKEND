const Brevo = require('@getbrevo/brevo');

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
const sendResetEmail = async(toEmail, subject, otpCode) => {
    try {

        const htmlContent = `
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background-color: #2d9cdb;
                    padding: 20px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }
                .header h1 {
                    font-size: 24px;
                    color: white;
                    margin: 0;
                }
                .content {
                    font-size: 16px;
                    color: #333333;
                    text-align: left;
                    padding: 20px;
                }
                .otp-code {
                    font-size: 32px;
                    font-weight: bold;
                    color: #2d9cdb;
                    margin: 20px 0;
                    text-align: center;
                }
                .footer {
                    text-align: center;
                    font-size: 14px;
                    color: #888888;
                    margin-top: 30px;
                }
                .footer a {
                    color: #888888;
                    text-decoration: none;
                }
                .footer p {
                    margin-top: 10px;
                }
            </style>
            <title>Código de Verificación</title>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>¡Hola!</h1>
                </div>
                <div class="content">
                    <p>Estás recibiendo este correo porque solicitaste cambiar tu contraseña. Para completar este proceso, por favor usa el siguiente código de verificación:</p>
                    <div class="otp-code">
                        ${otpCode}
                    </div>
                    <p>Este código es válido por 10 minutos. Si no solicitaste este cambio de contraseña, por favor ignora este correo.</p>
                </div>
                <div class="footer">
                    <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                    <p>&copy; 2025 SITRAMRD. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        const emailData = {
            sender: { name: "SITRAMRD", email: "sitramrd@gmail.com" },
            to: [{ email: toEmail }],
            subject: subject,
            htmlContent: htmlContent,
        };

        await apiInstance.sendTransacEmail(emailData);
        console.log(toEmail)
    } catch (error) {
        console.log("API Key:", process.env.BREVO_API_KEY);
        console.error("Error enviando correo:", error.response ? error.response.body : error.message);
    }
};

module.exports = sendResetEmail;