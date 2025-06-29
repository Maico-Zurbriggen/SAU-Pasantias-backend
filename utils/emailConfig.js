const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'zurbriggenmaico8@gmail.com', // Reemplazar con el email que enviará los correos
    pass: 'itnv qxeg mjky uyhv' // Usar una contraseña de aplicación de Gmail
  }
});

module.exports = transporter;