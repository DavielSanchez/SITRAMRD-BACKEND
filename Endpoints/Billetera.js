const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const Stripe = require('stripe')

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

const app = express();
app.use(express.json());

const userSchema = require('../models/Usuario');
const tarjetasVirtualesSchema = require('../models/tarjetasVirtuales');
const tarjetasFisicasSchema = require('../models/tarjetasFisicas');
const tarjetaTransaccionesSchema = require('../models/tarjetaTransacciones');

const generarNumeroTarjetaUnico = async() => {
    let numeroGenerado;
    let existe = true;

    while (existe) {
        numeroGenerado = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join("");

        const tarjetaExistente = await tarjetasVirtualesSchema.findOne({ numeroTarjeta: numeroGenerado });
        existe = !!tarjetaExistente;
    }

    return numeroGenerado;
};



/**
 * @swagger
 * /wallet/tarjetas/virtuales:
 *   get:
 *     summary: Listar todas las Tarjetas Virtuales
 *     description: Lista todas las tarjetas virtuales almacenadas en la base de datos.
 *     tags:
 *       - Billetera
 *     responses:
 *       200:
 *         description: Lista de todas las tarjetas virtuales.
 *       500:
 *         description: Error en la base de datos.
 */
router.get('/tarjetas/virtuales', (req, res) => {

    tarjetasVirtualesSchema
        .find()
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
            res.status(500).json({ message: "Error al obtener las tarjetas virtuales." })
        })
})

/**
 * @swagger
 * /wallet/tarjetas/fisicas:
 *   get:
 *     summary: Listar todas las Tarjetas Físicas
 *     description: Lista todas las tarjetas físicas almacenadas en la base de datos.
 *     tags:
 *       - Billetera
 *     responses:
 *       200:
 *         description: Lista de todas las tarjetas físicas.
 *       500:
 *         description: Error en la base de datos.
 */
router.get('/tarjetas/fisicas', (req, res) => {

    tarjetasFisicasSchema
        .find()
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
            res.status(500).json({ message: "Error al obtener las tarjetas físicas." })
        })
})

/**
 * @swagger
 * /wallet/tarjeta/virtual/{id}:
 *   get:
 *     summary: Obtener Tarjeta Virtual por ID
 *     description: Obtiene una tarjeta virtual específica usando su ID.
 *     tags:
 *       - Billetera
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: ID de la tarjeta virtual.
 *     responses:
 *       200:
 *         description: Tarjeta virtual encontrada.
 *       404:
 *         description: Tarjeta virtual no encontrada.
 *       500:
 *         description: Error en la base de datos.
 */
router.get('/tarjeta/virtual/:id', (req, res) => {

    const tarjetaId = req.params.id;

    tarjetasVirtualesSchema
        .findById(tarjetaId)
        .then((data) => {
            if (data) {
                res.json(data);
            } else {
                res.status(404).json({ message: "Tarjeta virtual no encontrada." });
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ message: "Error al obtener la tarjeta virtual." });
        });
});

/**
 * @swagger
 * /wallet/tarjeta/fisica/{id}:
 *   get:
 *     summary: Obtener Tarjeta Física por ID
 *     description: Obtiene una tarjeta física específica usando su ID.
 *     tags:
 *       - Billetera
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: ID de la tarjeta física.
 *     responses:
 *       200:
 *         description: Tarjeta física encontrada.
 *       404:
 *         description: Tarjeta física no encontrada.
 *       500:
 *         description: Error en la base de datos.
 */
router.get('/tarjeta/fisica/:id', (req, res) => {

    const tarjetaId = req.params.id;

    tarjetasFisicasSchema
        .findById(tarjetaId)
        .then((data) => {
            if (data) {
                res.json(data);
            } else {
                res.status(404).json({ message: "Tarjeta física no encontrada." });
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ message: "Error al obtener la tarjeta física." });
        });
});

/**
 * @swagger
 * /wallet/tarjeta/fisica/uid/{UID}:
 *   get:
 *     summary: Obtener Tarjeta Física por UID
 *     description: Obtiene una tarjeta física específica usando su UID.
 *     tags:
 *       - Billetera
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *           description: UID de la tarjeta física.
 *     responses:
 *       200:
 *         description: Tarjeta física encontrada.
 *       404:
 *         description: Tarjeta física no encontrada.
 *       500:
 *         description: Error en la base de datos.
 */
router.get('/tarjeta/fisica/uid/:uid', (req, res) => {

    const tarjetaUID = req.params.uid;

    tarjetasFisicasSchema
        .findById(tarjetaUID)
        .then((data) => {
            if (data) {
                res.json(data);
            } else {
                res.status(404).json({ message: "Tarjeta física no encontrada." });
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ message: "Error al obtener la tarjeta física." });
        });
});

/**
 * @swagger
 * /wallet/user/tarjetas/virtuales/{userId}:
 *   get:
 *     summary: Listar Tarjetas Virtuales del Usuario
 *     description: Lista todas las tarjetas virtuales asociadas al usuario.
 *     tags:
 *       - Billetera
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de tarjetas virtuales.
 *       404:
 *         description: Usuario o tarjetas no encontradas.
 */
router.get('/user/tarjetas/virtuales/:userId', (req, res) => {

    const userId = req.params.userId

    tarjetasVirtualesSchema
        .find({ idUsuario: userId })
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

/**
 * @swagger
 * /wallet/user/tarjetas/fisicas/{userId}:
 *   get:
 *     summary: Listar Tarjetas Fisicas del Usuario
 *     description: Lista todas las tarjetas fisicas asociadas al usuario.
 *     tags:
 *       - Billetera
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de tarjetas fisicas.
 *       404:
 *         description: Usuario o tarjetas no encontradas.
 */
router.get('/user/tarjetas/fisicas/:userId', (req, res) => {

    const userId = req.params.userId

    tarjetasFisicasSchema
        .find({ idUsuario: userId })
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

/**
 * @swagger
 * /wallet/tarjetas/virtuales/numero/{numeroTarjeta}:
 *   get:
 *     summary: Obtener la tarjeta vitual por el numero de tarjeta
 *     description: Mostrar la tarjeta virtual asociada al numero ingresado.
 *     tags:
 *       - Billetera
 *     parameters:
 *       - in: path
 *         name: numeroTarjeta
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tarjeta virtual.
 *       404:
 *         description: Tarjeta no encontrada.
 */
router.get('/tarjetas/virtuales/numero/:numeroTarjeta', (req, res) => {

    const numeroTarjeta = req.params.numeroTarjeta

    tarjetasVirtualesSchema
        .find({ numeroTarjeta: numeroTarjeta })
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

/**
 * @swagger
 * /wallet/tarjetas/fisica/numero/{numeroTarjeta}:
 *   get:
 *     summary: Obtener la tarjeta fisica por el numero de tarjeta
 *     description: Mostrar la tarjeta fisica asociada al numero ingresado.
 *     tags:
 *       - Billetera
 *     parameters:
 *       - in: path
 *         name: numeroTarjeta
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tarjeta fisica.
 *       404:
 *         description: Tarjeta no encontrada.
 */
router.get('/tarjetas/fisicas/numero/:numeroTarjeta', (req, res) => {

    const numeroTarjeta = req.params.numeroTarjeta

    tarjetasFisicasSchema
        .find({ numeroTarjeta: numeroTarjeta })
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

/**
 * @swagger
 * /wallet/recargas/{id}:
 *   get:
 *     summary: Obtener una recarga por ID
 *     description: Obtiene una transacción de tipo "Recarga" a partir de su ID único.
 *     tags:
 *       - Billetera
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la transacción de recarga.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos de la recarga encontrada.
 *       404:
 *         description: No se encontró ninguna recarga con el ID proporcionado.
 *       500:
 *         description: Error interno al consultar la base de datos.
 */
router.get('/recargas/:id', (req, res) => {
    const Id = req.params.id;

    tarjetaTransaccionesSchema
        .findOne({ _id: Id, tipo: 'Recarga' })
        .then((data) => {
            if (data) {
                res.json(data);
            } else {
                res.status(404).json({ message: "No se encontró una recarga con este ID." });
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ message: "Error al obtener la recarga." });
        });
});

/**
 * @swagger
 * /wallet/pagos/{id}:
 *   get:
 *     summary: Obtener un pago por ID
 *     description: Obtiene una transacción de tipo "Pago" a partir de su ID único.
 *     tags:
 *       - Billetera
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la transacción de pago.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del pago encontrado.
 *       404:
 *         description: No se encontró ningún pago con el ID proporcionado.
 *       500:
 *         description: Error interno al consultar la base de datos.
 */
router.get('/pagos/:id', (req, res) => {
    const Id = req.params.id;

    tarjetaTransaccionesSchema
        .findOne({ _id: Id, tipo: 'Pago' })
        .then((data) => {
            if (data) {
                res.json(data);
            } else {
                res.status(404).json({ message: "No se encontró un pago con este ID." });
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ message: "Error al obtener el pago." });
        });
});

/**
 * @swagger
 * /wallet/recargas/user/{userId}:
 *   get:
 *     summary: Obtener todas las recargas de un usuario
 *     description: Obtiene todas las transacciones de tipo "Recarga" asociadas a un usuario específico.
 *     tags:
 *       - Billetera
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de recargas realizadas por el usuario.
 *       404:
 *         description: Usuario o recargas no encontradas.
 *       500:
 *         description: Error en la base de datos.
 */
router.get('/recargas/user/:userId', (req, res) => {

    const userId = req.params.userId;

    tarjetaTransaccionesSchema
        .find({ idUsuario: userId, tipo: 'Recarga' })
        .then((data) => {
            if (!data || data.length === 0) {
                return res.status(404).json({ message: "No se encontraron recargas para este usuario." });
            }
            res.json(data);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ message: "Error al obtener las recargas." });
        });
});

/**
 * @swagger
 * /wallet/pagos/user/{userId}:
 *   get:
 *     summary: Obtener todos los pagos de tarifa de un usuario
 *     description: Obtiene todas las transacciones de tipo "Pago" asociadas a un usuario específico.
 *     tags:
 *       - Billetera
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de pagos realizados por el usuario.
 *       404:
 *         description: Usuario o pagos no encontrados.
 *       500:
 *         description: Error en la base de datos.
 */
router.get('/pagos/user/:userId', (req, res) => {

    const userId = req.params.userId;

    tarjetaTransaccionesSchema
        .find({ idUsuario: userId, tipo: 'Pago' })
        .then((data) => {
            if (!data || data.length === 0) {
                return res.status(404).json({ message: "No se encontraron pagos para este usuario." });
            }
            res.json(data);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ message: "Error al obtener los pagos." });
        });
});

/**
 * @swagger
 * /wallet/create-payment-intent:
 *   post:
 *     summary: Crear un Intento de Pago con Stripe
 *     description: Genera un Payment Intent en Stripe y devuelve el clientSecret necesario para procesar el pago.
 *     tags:
 *       - Billetera
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: integer
 *                 description: Monto del pago en la menor unidad de la moneda (por ejemplo, centavos para USD).
 *                 example: 5000
 *               currency:
 *                 type: string
 *                 description: Código de la moneda en formato ISO 4217.
 *                 example: "usd"
 *     responses:
 *       200:
 *         description: Client Secret generado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientSecret:
 *                   type: string
 *                   description: Client Secret para confirmar el pago en el frontend.
 *                   example: "pi_1234567890_secret_abcdefghij"
 *       400:
 *         description: Parámetros inválidos (monto o moneda faltante).
 *       500:
 *         description: Error interno del servidor.
 */
router.post("/create-payment-intent", async(req, res) => {
    try {
        const { amount, currency } = req.body;

        if (!amount || !currency) {
            return res.status(400).json({ error: "Monto y moneda son requeridos" });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
        });

        console.log("PaymentIntent creado:", paymentIntent); // 🔍 Debug

        if (!paymentIntent.client_secret) {
            throw new Error("Stripe no generó un client_secret");
        }

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error("Error en create-payment-intent:", error);
        res.status(500).json({ error: "Error interno en el servidor" });
    }
});


/**
 * @swagger
 * /tarjetas/virtuales/add:
 *   post:
 *     summary: Agregar una nueva tarjeta virtual
 *     description: Crea y guarda una nueva tarjeta virtual. Si no se proporciona una tarjeta física, se generará un número único para la tarjeta virtual.
 *     tags:
 *       - Billetera
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idUsuario:
 *                 type: string
 *                 description: ID del usuario propietario de la tarjeta virtual.
 *               tarjetaFisica:
 *                 type: string
 *                 description: ID de la tarjeta física asociada (opcional).
 *               numeroTarjeta:
 *                 type: string
 *                 description: Número de la tarjeta virtual. Si no se proporciona, se generará uno único.
 *               estadoUsuario:
 *                 type: string
 *                 enum: [Activa, Inactiva]
 *                 description: Estado de la tarjeta para el usuario (opcional, por defecto "Activa").
 *               estadoAdmin:
 *                 type: string
 *                 enum: [Activa, Bloqueada]
 *                 description: Estado administrativo de la tarjeta (opcional, por defecto "Activa").
 *               nombre:
 *                 type: string
 *                 description: Nombre asociado a la tarjeta (opcional).
 *               saldo:
 *                 type: number
 *                 description: Saldo inicial de la tarjeta (opcional, por defecto 0).
 *     responses:
 *       201:
 *         description: Tarjeta virtual registrada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID único de la tarjeta virtual registrada.
 *                 idUsuario:
 *                   type: string
 *                   description: ID del usuario propietario de la tarjeta.
 *                 tarjetaFisica:
 *                   type: string
 *                   description: ID de la tarjeta física asociada (si existe).
 *                 numeroTarjeta:
 *                   type: string
 *                   description: Número de la tarjeta virtual.
 *                 estadoUsuario:
 *                   type: string
 *                   description: Estado de la tarjeta para el usuario.
 *                 estadoAdmin:
 *                   type: string
 *                   description: Estado administrativo de la tarjeta.
 *                 saldo:
 *                   type: number
 *                   description: Saldo actual de la tarjeta virtual.
 *       400:
 *         description: Datos inválidos en la solicitud.
 *       500:
 *         description: Error interno al guardar la tarjeta virtual.
 */
router.post('/tarjetas/virtuales/add', async(req, res) => {
    try {
        const { idUsuario, tarjetaFisica, numeroTarjeta, estadoUsuario, estadoAdmin, nombre, saldo } = req.body;

        let numeroGenerado = numeroTarjeta;

        if (!tarjetaFisica) {
            numeroGenerado = 'V-' + await generarNumeroTarjetaUnico();
        }

        const nuevaTarjeta = new tarjetasVirtualesSchema({
            idUsuario,
            tarjetaFisica: tarjetaFisica || null,
            numeroTarjeta: numeroGenerado,
            estadoUsuario: estadoUsuario || "Activa",
            estadoAdmin: estadoAdmin || "Activa",
            nombre: nombre || "",
            saldo: saldo || 0,
        });

        const tarjetaGuardada = await nuevaTarjeta.save();
        res.status(201).json(tarjetaGuardada);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al registrar la tarjeta virtual." });
    }
});

/**
 * @swagger
 * /tarjetas/fisicas/add:
 *   post:
 *     summary: Agregar una nueva tarjeta física
 *     description: Crea y guarda una nueva tarjeta física. El número de la tarjeta debe ser único y será proporcionado manualmente.
 *     tags:
 *       - Billetera
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idUsuario:
 *                 type: string
 *                 description: ID del usuario propietario de la tarjeta física.
 *               numeroTarjeta:
 *                 type: string
 *                 description: Número único de la tarjeta física.
 *               estadoUsuario:
 *                 type: string
 *                 enum: [Activa, Inactiva]
 *                 description: Estado de la tarjeta para el usuario (opcional, por defecto "Activa").
 *               estadoAdmin:
 *                 type: string
 *                 enum: [Activa, Bloqueada]
 *                 description: Estado administrativo de la tarjeta (opcional, por defecto "Activa").
 *               nombre:
 *                 type: string
 *                 description: Nombre asociado a la tarjeta (opcional).
 *               saldo:
 *                 type: number
 *                 description: Saldo inicial de la tarjeta (opcional, por defecto 0).
 *     responses:
 *       201:
 *         description: Tarjeta física registrada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID único de la tarjeta física registrada.
 *                 idUsuario:
 *                   type: string
 *                   description: ID del usuario propietario de la tarjeta.
 *                 numeroTarjeta:
 *                   type: string
 *                   description: Número de la tarjeta física.
 *                 estadoUsuario:
 *                   type: string
 *                   description: Estado de la tarjeta para el usuario.
 *                 estadoAdmin:
 *                   type: string
 *                   description: Estado administrativo de la tarjeta.
 *                 saldo:
 *                   type: number
 *                   description: Saldo actual de la tarjeta física.
 *       400:
 *         description: Datos inválidos en la solicitud.
 *       500:
 *         description: Error interno al guardar la tarjeta física.
 */
router.post('/tarjetas/fisicas/add', async(req, res) => {
    try {
        const { idUsuario, numeroTarjeta, estadoUsuario, estadoAdmin, nombre, saldo } = req.body;

        const tarjetaExistente = await tarjetasFisicasSchema.findOne({ numeroTarjeta });

        if (tarjetaExistente) {
            return res.status(400).json({ message: "El número de tarjeta ya existe." });
        }

        const nuevaTarjetaFisica = new tarjetasFisicasSchema({
            idUsuario,
            numeroTarjeta,
            estadoUsuario: estadoUsuario || "Activa",
            estadoAdmin: estadoAdmin || "Activa",
            saldo: saldo || 0,
        });

        const tarjetaFisicaGuardada = await nuevaTarjetaFisica.save();

        const nuevaTarjetaVirtual = new tarjetasVirtualesSchema({
            idUsuario,
            tarjetaFisica: tarjetaFisicaGuardada._id,
            numeroTarjeta: numeroTarjeta,
            estadoUsuario: estadoUsuario || "Activa",
            estadoAdmin: estadoAdmin || "Activa",
            nombre: nombre || "",
            saldo: saldo || 0,
        });

        const tarjetaVirtualGuardada = await nuevaTarjetaVirtual.save();

        res.status(201).json(tarjetaFisicaGuardada);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Tarjeta física y virtual creadas correctamente.",
            tarjetaFisica: tarjetaFisicaGuardada,
            tarjetaVirtual: tarjetaVirtualGuardada
        });
    }
});








module.exports = router;