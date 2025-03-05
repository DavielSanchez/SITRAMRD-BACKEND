const express = require("express");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const specs = require("./swagger/swagger");
const cors = require("cors");
const http = require("http");
const morgan = require("morgan");

const { mongoConnection } = require("./DB");
const socketConfig = require("./socket");

dotenv.config();

const app = express();
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

app.use("/auth", Authentication);
app.use("/wallet", Billetera);
app.use("/ruta", Ruta);
app.use("/usuario", Usuarios);
app.use("/incidencia", Incidencia);
app.use("/chat", Chat);
app.use("/autobuses", Autobuses);

// 🔹 Configuración de WebSockets
socketConfig(server);

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

// 🔹 Iniciar el servidor
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
