const jwt = require('jsonwebtoken');
const transporter = require('./emailConfig');

const JWT_SECRET = 'tu-secreto-jwt'; // Usar una variable de entorno en producción

const sendResetEmail = async (email, userType) => {
  // Generar token
  const token = jwt.sign({ email, userType }, JWT_SECRET, { expiresIn: '1h' });
  
  // URL del frontend donde se procesará el reset
  const resetUrl = `https://maico-zurbriggen.github.io/SAU-Pasantias/#/reset-password?token=${token}`;

  // Configurar el email
  const mailOptions = {
    from: 'zurbriggenmaico8@gmail.com',
    to: email,
    subject: 'Recuperación de Contraseña - SAU Pasantías',
    html: `
      <h1>Recuperación de Contraseña</h1>
      <p>Has solicitado restablecer tu contraseña.</p>
      <p>Haz clic en el siguiente enlace para establecer una nueva contraseña:</p>
      <a href="${resetUrl}">Restablecer Contraseña</a>
      <p>Este enlace expirará en 1 hora.</p>
      <p>Si no solicitaste este cambio, ignora este correo.</p>
    `
  };

  // Enviar el email
  return transporter.sendMail(mailOptions);
};

module.exports = { sendResetEmail, JWT_SECRET };