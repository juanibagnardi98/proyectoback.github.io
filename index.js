const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const productsRouter = require('./src/routes/products.router');
const cartsRouter = require('./src/routes/carts.router');
const viewsRouter = require('./src/routes/views.router');
const { getPersistenceType } = require('./src/dao/daoFactory');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = parseInt(process.env.PORT, 10) || 8080;

app.set('io', io);
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'views'));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, 'public')));

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

app.get('/', (req, res) => res.redirect('/products'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ status: 'error', error: 'Error interno del servidor' });
});

io.on('connection', socket => {
  console.log('Cliente WebSocket conectado:', socket.id);
});

async function startServer() {
  const persistenceType = getPersistenceType();
  if (persistenceType === 'mongo') {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    try {
      await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log('Conectado a MongoDB');
    } catch (error) {
      console.warn('No se pudo conectar a MongoDB:', error.message);
      console.warn('El sistema seguirá funcionando con FileSystem. Para usar MongoDB, ajuste PERSISTENCE=mongo y verifique la conexión.');
      process.env.PERSISTENCE = 'fs';
    }
  }

  server.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`Persistencia activa: ${process.env.PERSISTENCE || persistenceType}`);
  });
}

startServer();