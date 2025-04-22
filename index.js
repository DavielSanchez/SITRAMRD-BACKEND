const express = require("express");
const http = require('http')
const socketIo = require('socket.io')
const dotenv = require('dotenv')
const swaggerUi = require('swagger-ui-express')
const specs = require('./swagger/swagger')
const cors = require('cors')
const { mongoConnection } = require('./DB')
const logger = require('morgan')
dotenv.config();
const app = express();
const server = http.createServer(app)
const socketConfig = require('./socket')

const Authentication = require('./Endpoints/Authentication')
const Billetera = require('./Endpoints/Billetera')
const Ruta = require('./Endpoints/Ruta')
const Incidencia = require('./Endpoints/Incidencia')
const Usuarios = require('./Endpoints/Usuario')
const ConsultaDeRutas = require('./Endpoints/ConsultaDeRutas')
const ConsultaDeRutas2 = require('./Endpoints/consultaderutasviejo')
const Autobus = require('./Endpoints/AutoBus')
const Chat = require('./Endpoints/Chat')
const Actividad = require('./Endpoints/Actividad')

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
app.use(express.json());
/**
 * @swagger
 * tags:
 *   - name: Principal | Bienvenida
 *   - name: Autenticación | Usuarios
 */

app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs))


app.use('/auth', Authentication)
app.use('/wallet', Billetera)
app.use('/ruta', Ruta)
app.use('/ruta', ConsultaDeRutas)
app.use('/ruta2', ConsultaDeRutas2)
app.use('/autobus', Autobus)
app.use('/usuario', Usuarios)
app.use('/incidencia', Incidencia)
app.use('/chat', Chat)
app.use('/actividad', Actividad)

socketConfig(server)

/**
 * @openapi
 * /:
 *   get:
 *     summary: EndPoint principal de la API.
 *     description: Bienvenido a la API de SITRAMRD!
 *     tags: [Principal | Bienvenida]
 *     responses:
 *       200:
 *         description: Retorna un mensaje de aprobacion por Ok.
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


server.listen(process.env.PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${process.env.PORT}`);
})