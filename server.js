const jsonServer = require('json-server');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./utils/resetPassword');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const { sendResetEmail } = require('./utils/resetPassword');

server.use(cors({
  origin: 'https://maico-zurbriggen.github.io',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Ruta para solicitar reset de contraseña
server.post('/request-reset', async (req, res) => {
  const { email, userType } = req.body;
  const db = router.db; // Obtener la base de datos

  try {
    // Verificar si el usuario existe
    let user;
    if (userType === 'admin') {
      user = db.get('admin').find({ email }).value();
    } else if (userType === 'empresa') {
      user = db.get('empresas').find({ email }).value();
    }

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Enviar email de recuperación
    await sendResetEmail(email, userType);
    res.json({ message: 'Email de recuperación enviado' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

// Ruta para actualizar la contraseña
server.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  const db = router.db;

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, JWT_SECRET);
    const { email, userType } = decoded;

    // Actualizar la contraseña
    if (userType === 'admin') {
      db.get('admin')
        .find({ email })
        .assign({ password: newPassword })
        .write();
    } else if (userType === 'empresa') {
      db.get('empresas')
        .find({ email })
        .assign({ password: newPassword })
        .write();
    }

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: 'Token inválido o expirado' });
  }
});

server.use(router);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`JSON Server está corriendo en el puerto ${PORT}`);
});
