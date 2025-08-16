const jsonServer = require('json-server');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./utils/resetPassword');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const { sendResetEmail } = require('./utils/resetPassword');
const { verifyPassword } = require('./utils/passwordUtils');

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

    // Hash de la nueva contraseña
    const hashedPassword = await hashPassword(newPassword);

    // Actualizar la contraseña
    if (userType === 'admin') {
      db.get('admin')
        .find({ email })
        .assign({ password: hashedPassword })
        .write();
    } else if (userType === 'empresa') {
      db.get('empresas')
        .find({ email })
        .assign({ password: hashedPassword })
        .write();
    }

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: 'Token inválido o expirado' });
  }
});

server.use(router);

// Ruta para login
server.post('/login', async (req, res) => {
  const { email, password, userType } = req.body;
  const db = router.db;

  try {
    // Buscar usuario
    let user;
    if (userType === 'admin') {
      user = db.get('admin').find({ email }).value();
    } else if (userType === 'empresa') {
      user = db.get('empresas').find({ email }).value();
    } else if (userType === 'alumno') {
      user = db.get('alumnos_simulados').find({ email }).value();
    }

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar contraseña
    const passwordMatch = await verifyPassword(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Generar token de sesión
    const token = jwt.sign(
      { id: user.id, email: user.email, userType },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        userType,
        // Otros datos del usuario que quieras enviar
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`JSON Server está corriendo en el puerto ${PORT}`);
});
