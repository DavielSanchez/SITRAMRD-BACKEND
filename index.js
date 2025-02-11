const express = require("express");
const dotenv = require('dotenv')
const swaggerUi = require('swagger-ui-express')
const specs = require('./swagger/swagger')
const cors = require('cors')
const { mongoConnection } = require('./DB')
dotenv.config();
const app = express();

app.use(express.json());
mongoConnection(process.env.MONGODB_URI)




app.use(cors({
    origin: ['*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs))
    /**
     * @swagger
     * tags:
     *   name: Principal | Bienvenida
     */

/**
 * @openapi
 * /api:
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


app.listen(process.env.PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${process.env.PORT}`);
})