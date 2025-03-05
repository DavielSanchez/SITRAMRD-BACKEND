const express = require("express");
<<<<<<< HEAD
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const specs = require("./swagger/swagger");
const cors = require("cors");
const http = require("http");
const morgan = require("morgan");

const { mongoConnection } = require("./DB");
const socketConfig = require("./socket");

=======
const http = require('http')
const socketIo = require('socket.io')
const dotenv = require('dotenv')
const swaggerUi = require('swagger-ui-express')
const specs = require('./swagger/swagger')
const cors = require('cors')
const { mongoConnection } = require('./DB')
const logger = require('morgan')
>>>>>>> develop
dotenv.config();

const app = express();
<<<<<<< HEAD
const server = http.createServer(app); // Servidor HTTP

// 🔹 Conexión a MongoDB
mongoConnection(process.env.MONGODB_URI);

// 🔹 Configuración de Middlewares
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
app.use(morgan("dev"));
=======
const server = http.createServer(app)
const socketConfig = require('./socket')

const Authentication = require('./Endpoints/Authentication')
const Billetera = require('./Endpoints/Billetera')
const Ruta = require('./Endpoints/Ruta')
const Incidencia = require('./Endpoints/Incidencia')
const Usuarios = require('./Endpoints/Usuario');
const Chat = require('./Endpoints/Chat')

mongoConnection(process.env.MONGODB_URI)



// app.use(cors());
app.use(cors({
    // origin: "http://localhost:5173",
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Agregar Authorization aquí
    credentials: true
}));
app.use(logger('dev'))
app.use('/wallet/webhook-stripe', express.raw({ type: 'application/json' }));
>>>>>>> develop
app.use(express.json());

// 🔹 Documentación Swagger
/**
 * @swagger
 * tags:
 *   - name: Principal | Bienvenida
 *   - name: Autenticación | Usuarios
 */
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));

// 🔹 Importación y uso de rutas
const Authentication = require("./Endpoints/Authentication");
const Billetera = require("./Endpoints/Billetera");
const Ruta = require("./Endpoints/Ruta");
const Incidencia = require("./Endpoints/Incidencia");
const Usuarios = require("./Endpoints/Usuario");
const Chat = require("./Endpoints/Chat");
const Autobuses = require("./Endpoints/Autobuses");

<<<<<<< HEAD
app.use("/auth", Authentication);
app.use("/wallet", Billetera);
app.use("/ruta", Ruta);
app.use("/usuario", Usuarios);
app.use("/incidencia", Incidencia);
app.use("/chat", Chat);
app.use("/autobuses", Autobuses);

// 🔹 Configuración de WebSockets
socketConfig(server);
=======

app.use('/auth', Authentication)
app.use('/wallet', Billetera)
app.use('/ruta', Ruta)
app.use('/usuario', Usuarios)
app.use('/incidencia', Incidencia)
app.use('/chat', Chat)

socketConfig(server)
>>>>>>> develop

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

<<<<<<< HEAD
// 🔹 Iniciar el servidor
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
=======

server.listen(process.env.PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${process.env.PORT}`);
})
>>>>>>> develop
