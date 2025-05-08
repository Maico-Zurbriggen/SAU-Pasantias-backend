const jsonServer = require('json-server');
const cors = require('cors');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(cors({
  origin: 'https://maico-zurbriggen.github.io',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
server.use(middlewares);
server.use(router);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`JSON Server está corriendo en el puerto ${PORT}`);
});
