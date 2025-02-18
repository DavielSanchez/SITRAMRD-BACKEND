const express = require("express");
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const specs = require('./swagger/swagger');
const cors = require('cors');
const socketIo = require("socket.io");
const http = require("http");

const { mongoConnection } = require('./DB');
dotenv.config();

const app = express();
const server = http.createServer(app); // Crear el servidor HTTP

const io = socketIo(server, {
    cors: {
        origin: "*",
    },
});

// Importar rutas
const Authentication = require('./Endpoints/Authentication');
const vehicleRoutes = require('./routes/vehicleRoutes');
const socketHandler = require("./sockets/socketHandler");  // Importamos el manejador de sockets

mongoConnection(process.env.MONGODB_URI);

app.use(cors());
app.use(express.json());

/**
 * @swagger
 * tags:
 *   - name: Principal | Bienvenida
 *   - name: Autenticación | Usuarios
 */
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/auth', Authentication);
app.use('/vehicles', vehicleRoutes);

// Manejo de Socket.IO con el handler externo
socketHandler(io);  // Aquí llamamos la función para gestionar los eventos de socket

/**
 * @openapi
 * /:
 *   get:
 *     summary: EndPoint principal de la API.
 *     description: Bienvenido a la API de SITRAMRD!
 *     tags: [Principal | Bienvenida]
 *     responses:
 *       200:
 *         description: Retorna un mensaje de aprobación por Ok.
 *         content:
 *             application/json:
 *                  schema:
 *                      type: string
 *       400: 
 *         description: Retorna un mensaje de error por Bad Request.
 *       404:
 *         description: Retorna un mensaje de error por Not Found.
 */
app.get("/", (req, res) => {
    res.json({ mensaje: "¡Bienvenido a la API de SITRAMRD!" });
});

// Iniciar servidor en el puerto
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
