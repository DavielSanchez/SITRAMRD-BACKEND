const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const Stripe = require('stripe')
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
const stripe_webhook_secret = process.env.STRIPE_WEBHOOK_SECRET
const SECRET_KEY = process.env.VITE_QR_KEY
const OTP_EXPIRATION = "5m";


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
            console.error(error);
            res.status(500).json({ error: 'Error al obtener las tarjetas virtuales' });
        });
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
router.get('/recargas/user/:userId', async(req, res) => {
    try {
        const userId = req.params.userId;

        const recargas = await tarjetaTransaccionesSchema.find({ idUsuario: userId, tipo: 'Recarga' });
        if (!recargas || recargas.length === 0) {
            return res.status(204).json({ message: "No se encontraron recargas para este usuario." });
        }
        const tarjetasIds = [...new Set(recargas.map(r => String(r.tarjetaVirtual)))];

        const tarjetas = await tarjetasVirtualesSchema.find({ _id: { $in: tarjetasIds } });

        const tarjetasMap = {};
        tarjetas.forEach(tarjeta => {
            tarjetasMap[String(tarjeta._id)] = tarjeta.nombre;
        });

        const recargasConNombre = recargas.map(recarga => ({
            ...recarga.toObject(),
            nombreTarjeta: tarjetasMap[String(recarga.tarjetaVirtual)] || "Desconocida"
        }));

        res.json(recargasConNombre);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener las recargas." });
    }
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
 * /wallet/recarga/tarjeta/{tarjetaVirtual}:
 *   get:
 *     summary: Obtener las transacciones de recarga de una tarjeta virtual
 *     description: Este endpoint devuelve todas las transacciones de recarga realizadas a una tarjeta virtual específica.
 *     tags:
 *       - Billetera
 *     parameters:
 *       - name: tarjetaVirtual
 *         in: path
 *         required: true
 *         description: El ID de la tarjeta virtual para la cual se desean obtener las transacciones de recarga.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de transacciones de recarga para la tarjeta virtual.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: El ID de la transacción.
 *                     example: "603d9e35f8db3e1a1c85e73c"
 *                   tarjetaVirtual:
 *                     type: string
 *                     description: El ID de la tarjeta virtual asociada a la transacción.
 *                     example: "1234567890abcdef"
 *                   tipo:
 *                     type: string
 *                     description: El tipo de transacción (por ejemplo, "Recarga").
 *                     example: "Recarga"
 *                   monto:
 *                     type: number
 *                     description: El monto de la transacción de recarga.
 *                     example: 100
 *                   estado:
 *                     type: string
 *                     description: El estado de la transacción (por ejemplo, "Completada").
 *                     example: "Completada"
 *                   fecha:
 *                     type: string
 *                     description: La fecha y hora en la que se realizó la transacción.
 *                     example: "2025-03-23T12:00:00Z"
 *       404:
 *         description: No se encontraron transacciones para la tarjeta virtual especificada.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/recarga/tarjeta/:tarjetaVirtual', (req, res) => {

    const tarjetaVirtual = req.params.tarjetaVirtual;

    tarjetaTransaccionesSchema
        .find({ tarjetaVirtual: tarjetaVirtual, tipo: 'Recarga' })
        .then((data) => {
            if (!data || data.length === 0) {
                return res.status(204).json({ message: "No se encontraron transacciones para este usuario." });
            }
            res.json(data);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ message: "Error al obtener las transacciones." });
        });
});

router.get('/pagos/tarjeta/:tarjetaVirtual', (req, res) => {

    const tarjetaVirtual = req.params.tarjetaVirtual;

    tarjetaTransaccionesSchema
        .find({ tarjetaVirtual: tarjetaVirtual, tipo: 'Pago' })
        .then((data) => {
            if (!data || data.length === 0) {
                console.log("No se encontraron pagos para este usuario.")
                return res.status(204).json({ message: "No se encontraron pagos para este usuario." });
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
 * /wallet/metodos-pago/{userId}:
 *   get:
 *     summary: Obtener los métodos de pago guardados de un usuario
 *     description: Este endpoint devuelve todos los métodos de pago guardados para un usuario específico. La respuesta incluye los detalles de los métodos de pago guardados en Stripe.
 *     tags:
 *       - Billetera
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: El ID del usuario del cual se desean obtener los métodos de pago guardados.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de métodos de pago guardados para el usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 metodosPago:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: El ID del método de pago en Stripe.
 *                         example: "pm_1GqICJ2eZvKYlo2CzCVpLzRh"
 *                       tipo:
 *                         type: string
 *                         description: Tipo de método de pago (por ejemplo, "tarjeta de crédito").
 *                         example: "tarjeta de crédito"
 *                       ultimaCuatro:
 *                         type: string
 *                         description: Los últimos 4 dígitos de la tarjeta.
 *                         example: "4242"
 *                       fechaExpiracion:
 *                         type: string
 *                         description: Fecha de expiración del método de pago.
 *                         example: "12/25"
 *       404:
 *         description: El usuario no fue encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/metodos-pago/:userId", async(req, res) => {
    try {
        const usuario = await userSchema.findById(req.params.userId);
        if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

        res.json({ metodosPago: usuario.metodosPago });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al consultar los métodos de pago" });
    }
});

/**
 * @swagger
 * /wallet/create-payment-intent:
 *   post:
 *     summary: Recargar saldo en la tarjeta virtual
 *     description: Recarga saldo en la tarjeta virtual del usuario mediante Stripe. Se crea un PaymentIntent y se devuelve un `clientSecret` que se utilizará para confirmar el pago desde el frontend.
 *     tags:
 *       - Billetera
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID del usuario que realiza la recarga.
 *               tarjetaId:
 *                 type: string
 *                 description: ID de la tarjeta virtual donde se recargará el saldo.
 *               amount:
 *                 type: number
 *                 description: Monto a recargar en la tarjeta virtual, expresado en unidades de la moneda (por ejemplo, 50 para $50).
 *               currency:
 *                 type: string
 *                 description: La moneda en la que se realizará el pago (por ejemplo, "usd").
 *     responses:
 *       200:
 *         description: PaymentIntent creado exitosamente. El `clientSecret` se proporciona para confirmar el pago.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientSecret:
 *                   type: string
 *                   description: Client Secret para confirmar el pago en el frontend.
 *                   example: "pi_1234567890_secret_abcdefghij"
 *                 saldoActual:
 *                   type: number
 *                   description: El saldo actual de la tarjeta virtual después de la transacción.
 *                   example: 100
 *                 estado:
 *                   type: string
 *                   description: El estado de la transacción (por ejemplo, "Pendiente").
 *                   example: "Pendiente"
 *       400:
 *         description: Parámetros inválidos (monto o moneda faltante).
 *       404:
 *         description: La tarjeta virtual especificada no fue encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.post("/create-payment-intent", async(req, res) => {
    try {
        const { userId, tarjetaId, amount, currency } = req.body;

        if (!userId || !amount || !currency) {
            return res.status(400).json({ error: "Todos los campos son requeridos" });
        }

        // Crear el PaymentIntent en Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Convertir el monto a centavos
            currency,
            automatic_payment_methods: { enabled: true },
        });

        if (!paymentIntent.client_secret) {
            return res.status(500).json({ error: "Stripe no generó un client_secret" });
        }

        // Buscar la tarjeta virtual del usuario
        let tarjeta = await tarjetasVirtualesSchema.findOne({ _id: tarjetaId });
        if (!tarjeta) {
            return res.status(404).json({ error: "Tarjeta virtual no encontrada" });
        }

        // Registrar la transacción como pendiente por ahora
        const transaccion = new tarjetaTransaccionesSchema({
            idUsuario: userId,
            tarjetaVirtual: tarjeta._id,
            tipo: "Recarga",
            monto: amount,
            estado: "Pendiente", // Inicialmente, la transacción está pendiente
        });
        await transaccion.save();

        res.json({
            success: true,
            saldoActual: tarjeta.saldo,
            clientSecret: paymentIntent.client_secret,
            estado: "Pendiente", // Inicialmente, el estado es pendiente
        });
    } catch (error) {
        console.error("Error en recarga:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

/**
 * @swagger
 * /wallet/pay-with-saved-method:
 *   post:
 *     summary: Procesar un pago con un método de pago guardado
 *     description: Este endpoint procesa un pago utilizando un método de pago guardado previamente en Stripe. Se genera un PaymentIntent y se devuelve un `clientSecret` para confirmar el pago desde el frontend.
 *     tags:
 *       - Billetera
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID del usuario que está realizando el pago.
 *               amount:
 *                 type: number
 *                 description: Monto a pagar, expresado en unidades de la moneda (por ejemplo, 50 para $50).
 *               currency:
 *                 type: string
 *                 description: La moneda en la que se realizará el pago (por ejemplo, "usd").
 *     responses:
 *       200:
 *         description: El pago se procesó correctamente y se generó el PaymentIntent. El `clientSecret` se proporciona para confirmar el pago en el frontend.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica si el pago y la transacción fueron procesados correctamente.
 *                   example: true
 *                 clientSecret:
 *                   type: string
 *                   description: Client Secret para confirmar el pago.
 *                   example: "pi_1234567890_secret_abcdefghij"
 *       400:
 *         description: Parámetros inválidos (userId, amount, currency, o paymentMethodId faltante).
 *       404:
 *         description: El método de pago guardado no fue encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.post("/pay-with-saved-method", async(req, res) => {
    try {
        const { userId, amount, currency, paymentMethodId, tarjetaId } = req.body;

        if (!userId || !amount || !currency || !paymentMethodId) {
            return res.status(400).json({ error: "Todos los campos son requeridos" });
        }

        const user = await userSchema.findById(userId);
        if (!user || !user.customerId) {
            return res.status(400).json({ error: "No se encontró el customerId para este usuario" });
        }

        const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
        if (paymentMethod.customer !== user.customerId) {
            return res.status(400).json({ error: "Este método de pago no está asociado al usuario" });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency,
            customer: user.customerId,
            payment_method: paymentMethodId,
            automatic_payment_methods: { enabled: true }, // Mantén esto activado
        });

        if (!paymentIntent.client_secret) {
            return res.status(500).json({ error: "Stripe no generó un client_secret" });
        }

        // Guarda la transacción como "Pendiente"
        const transaccion = new tarjetaTransaccionesSchema({
            idUsuario: userId,
            tarjetaVirtual: tarjetaId,
            tipo: "Recarga",
            monto: amount,
            estado: "Pendiente",
            fecha: new Date(),
        });
        await transaccion.save();

        // 📢 Enviar el `client_secret` al frontend para que confirme el pago
        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error("Error en el pago:", error);
        res.status(500).json({ error: "Error al procesar el pago" });
    }
});

/**
 * @swagger
 * /wallet/webhook-stripe:
 *   post:
 *     summary: Maneja eventos de webhook de Stripe
 *     description: Recibe y procesa los eventos de Stripe para actualizar el estado de las transacciones y el saldo de las tarjetas virtuales.
 *     tags:
 *       - Billetera
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stripeSignature:
 *                 type: string
 *                 description: La firma de Stripe que se usa para verificar que la solicitud proviene de Stripe.
 *     responses:
 *       200:
 *         description: Evento procesado exitosamente. La transacción se marca como completada y el saldo de la tarjeta virtual se actualiza.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica si el procesamiento fue exitoso.
 *                   example: true
 *                 transaccion:
 *                   type: object
 *                   description: La transacción actualizada con estado "Completado".
 *                   properties:
 *                     estado:
 *                       type: string
 *                       description: Estado de la transacción.
 *                       example: "Completado"
 *                     monto:
 *                       type: number
 *                       description: Monto de la transacción procesada.
 *                       example: 50
 *       400:
 *         description: Error al verificar la firma de Stripe o evento no manejado.
 *       404:
 *         description: No se encontró una transacción pendiente con el monto correspondiente.
 *       500:
 *         description: Error interno del servidor al actualizar la transacción.
 */
// stripe listen --forward-to http://localhost:3001/wallet/webhook-stripe
router.post('/webhook-stripe', express.raw({ type: 'application/json' }), async(req, res) => {
    console.log('Webhook recibido');
    const sig = req.headers['stripe-signature'];

    console.log('Tipo de body:', typeof req.body);
    console.log('Cuerpo:', req.body);

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, stripe_webhook_secret);
        console.log("✅ Webhook verificado:", event.type);
    } catch (err) {
        console.error('⚠️  Error verificando webhook:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const amount = paymentIntent.amount / 100;

        console.log('✅ Pago confirmado para:', paymentIntent.id);

        try {
            const transaccion = await tarjetaTransaccionesSchema.findOneAndUpdate({ estado: 'Pendiente', monto: amount }, { estado: 'Completado' }, { new: true });

            if (!transaccion) {
                console.warn('⚠️ No se encontró una transacción pendiente.');
                return res.status(404).json({ error: 'No se encontró transacción pendiente' });
            }

            const tarjeta = await tarjetasVirtualesSchema.findById(transaccion.tarjetaVirtual);
            if (tarjeta) {
                tarjeta.saldo += amount;
                await tarjeta.save();
            }

            console.log('✅ Transacción actualizada a Completado:', transaccion);
            return res.json({ success: true, transaccion });
        } catch (error) {
            console.error('❌ Error al actualizar la transacción:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    } else {
        console.log(`ℹ️ Evento no manejado: ${event.type}`);
        // Enviar 200 para evitar reintentos de Stripe
        return res.sendStatus(200);
    }
});

/**
 * @swagger
 * /wallet/guardar-metodo-pago:
 *   post:
 *     summary: Guarda un método de pago para un usuario
 *     description: Asocia un nuevo método de pago a un usuario y lo establece como el método de pago predeterminado en Stripe.
 *     tags:
 *       - Billetera
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID del usuario que está agregando el método de pago.
 *               paymentMethodId:
 *                 type: string
 *                 description: ID del método de pago que se va a guardar.
 *     responses:
 *       200:
 *         description: El método de pago se guardó exitosamente y se asignó como predeterminado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   description: Mensaje que indica el éxito de la operación.
 *                   example: "Método de pago guardado exitosamente"
 *       400:
 *         description: Parámetros faltantes o inválidos en la solicitud.
 *       404:
 *         description: No se encontró el usuario con el ID proporcionado.
 *       500:
 *         description: Error interno del servidor al guardar el método de pago.
 */
router.post("/guardar-metodo-pago", async(req, res) => {
    try {
        const { userId, Apodo, paymentMethodId } = req.body;

        console.log(req.body)

        const usuario = await userSchema.findById(userId);
        if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

        await stripe.paymentMethods.attach(paymentMethodId, {
            customer: usuario.customerId,
        });

        await stripe.customers.update(usuario.customerId, {
            invoice_settings: { default_payment_method: paymentMethodId },
        });

        const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

        console.log("Apodo antes de agregar a metodosPago:", Apodo);

        usuario.metodosPago.push({
            Apodo: req.body.Apodo,
            paymentMethodId,
            cardType: paymentMethod.card.brand,
            last4: paymentMethod.card.last4,
            expMonth: paymentMethod.card.exp_month,
            expYear: paymentMethod.card.exp_year,
            brand: paymentMethod.card.brand,
        });

        await usuario.save();

        res.json({ mensaje: "Método de pago guardado exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al guardar el método de pago" });
    }
});

router.post("/generate-otp", async(req, res) => {
    const { userId, tarjetaId } = req.body;

    if (!userId || !tarjetaId) {
        return res.status(400).json({ error: "Faltan datos" });
    }

    try {
        const user = await userSchema.findById(userId);

        if (!user) {
            return res.status(400).json({ error: "Usuario no encontrado" });
        }

        const otpToken = jwt.sign({ userId, tarjetaId }, SECRET_KEY, {
            expiresIn: 50000,
        });
        user.payOtpCode = otpToken;
        user.payOtpTimeStamp = Date.now();
        await user.save();

        res.json({ token: otpToken });
    } catch (err) {
        console.error("Error en la generación del OTP:", err);
        res.status(500).json({ error: "Error al generar OTP" });
    }

})

router.post('/validate-otp', async(req, res) => {
    const { token } = req.body;

    try {
        if (!token) {
            return res.status(400).json({ error: "Faltan datos" });
        }

        const decoded = jwt.verify(token, SECRET_KEY);

        const user = await Usuario.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const otpExpirationTime = 5 * 60 * 1000;
        if (Date.now() - user.otpTimestamp > otpExpirationTime) {
            return res.status(400).json({ error: "OTP expirado" });
        }

        if (user.otpCode !== token) {
            return res.status(400).json({ error: "OTP incorrecto" });
        }

        res.json({ success: true, message: "OTP validado correctamente", data: decoded });
    } catch (err) {
        res.status(400).json({ error: "Token inválido o expirado" });
    }
})

/**
 * @swagger
 * /wallet/pagar:
 *   post:
 *     summary: Pagar un viaje en autobús/metro
 *     description: Descuenta saldo de la tarjeta virtual seleccionada del usuario y registra la transacción.
 *     tags:
 *       - Billetera
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               tarjetaId:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Pago exitoso.
 */
router.post("/pagar", async(req, res) => {
    try {
        const { userId, tarjetaId, amount } = req.body;

        if (!userId || !tarjetaId || !amount) {
            return res.status(400).json({ error: "Usuario, tarjeta y monto son requeridos" });
        }

        // Buscamos la tarjeta virtual específica por tarjetaId
        let tarjeta = await tarjetasVirtualesSchema.findOne({ idUsuario: userId, _id: tarjetaId });
        if (!tarjeta) {
            return res.status(404).json({ error: "No se encontró la tarjeta virtual del usuario." });
        }

        // Verificamos si la tarjeta tiene saldo suficiente
        if (tarjeta.saldo < amount) {
            return res.status(400).json({ error: "Saldo insuficiente en la tarjeta virtual" });
        }

        // Descontamos el monto de la tarjeta
        tarjeta.saldo -= amount;
        await tarjeta.save(); // Guardamos la actualización del saldo

        // Registramos la transacción de pago
        const transaccion = new tarjetaTransaccionesSchema({
            idUsuario: userId,
            tarjetaVirtual: tarjeta._id,
            tipo: "Pago",
            monto: amount,
            estado: "Completado",
        });
        await transaccion.save(); // Guardamos la transacción

        // Respondemos con el saldo actualizado de la tarjeta
        res.json({ success: true, saldoActual: tarjeta.saldo });
    } catch (error) {
        console.error("Error en pago:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

/**
 * @swagger
 * /wallet/tarjetas/virtuales/add:
 *   post:
 *     summary: Agregar una nueva tarjeta virtual
 *     description: Crea y guarda una nueva tarjeta virtual. Si no se proporciona una tarjeta física, se generará un número único para la tarjeta virtual. Si se proporciona una tarjeta física, se creará la tarjeta virtual y se asociará con la tarjeta física, transfiriendo el saldo de la tarjeta física a la virtual.
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
 *                 description: ID de la tarjeta física asociada (opcional). Si se proporciona, el saldo de la tarjeta física se transferirá a la tarjeta virtual.
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
 *                 description: Saldo inicial de la tarjeta virtual (opcional, por defecto 0).
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
 *         description: La tarjeta física proporcionada no existe o los datos son inválidos.
 *       500:
 *         description: Error interno al guardar la tarjeta virtual.
 */
router.post('/tarjetas/virtuales/add', async(req, res) => {
    try {
        const { idUsuario, numeroTarjeta, nombre } = req.body;

        let numeroGenerado = numeroTarjeta;
        let saldoInicial = 0;

        if (numeroTarjeta) {
            const tarjetaFisicaExistente = await tarjetasFisicasSchema.findOne({
                numeroTarjeta
            });
            if (!tarjetaFisicaExistente) {
                return res.status(400).json({ message: "La tarjeta física proporcionada no existe." });
            }
            saldoInicial = tarjetaFisicaExistente.saldo;
        } else {
            numeroGenerado = 'V-' + await generarNumeroTarjetaUnico();
        }

        const cantidadTarjetas = await tarjetasVirtualesSchema.countDocuments({ idUsuario });

        const nuevaTarjeta = new tarjetasVirtualesSchema({
            idUsuario,
            tarjetaFisica: numeroTarjeta ? tarjetaFisicaExistente._id : null,
            numeroTarjeta: numeroGenerado,
            nombre: nombre || "",
            saldo: saldoInicial,
            principal: cantidadTarjetas === 0
        });

        const tarjetaGuardada = await nuevaTarjeta.save();

        res.status(201).json({
            message: "Tarjeta virtual registrada exitosamente.",
            tarjeta: tarjetaGuardada
        });

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
 *     description: Crea y guarda una nueva tarjeta física. Esta tarjeta será proporcionada a los usuarios cuando se adquieran.
 *     tags:
 *       - Billetera
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numeroTarjeta:
 *                 type: string
 *                 description: Número único de la tarjeta física que se va a agregar.
 *               estadoUsuario:
 *                 type: string
 *                 enum: [Activa, Inactiva]
 *                 description: Estado de la tarjeta para el usuario (opcional, por defecto "Activa").
 *               estadoAdmin:
 *                 type: string
 *                 enum: [Activa, Bloqueada]
 *                 description: Estado administrativo de la tarjeta (opcional, por defecto "Activa").
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
        const { numeroTarjeta, estadoUsuario, estadoAdmin, saldo } = req.body;

        const tarjetaExistente = await tarjetasFisicasSchema.findOne({ numeroTarjeta });

        if (tarjetaExistente) {
            return res.status(400).json({ message: "El número de tarjeta ya existe." });
        }

        const nuevaTarjetaFisica = new tarjetasFisicasSchema({
            numeroTarjeta,
            estadoUsuario: estadoUsuario || "Activa",
            estadoAdmin: estadoAdmin || "Activa",
            saldo: saldo || 0,
        });

        const tarjetaFisicaGuardada = await nuevaTarjetaFisica.save();

        res.status(201).json(tarjetaFisicaGuardada);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error interno al guardar la tarjeta física." });
    }
});

/**
 * @swagger
 * /wallet/tarjetas/set-principal:
 *   post:
 *     summary: Establecer una tarjeta como principal
 *     description: Este endpoint permite al usuario establecer una tarjeta virtual como su tarjeta principal, desmarcando previamente cualquier otra tarjeta que esté marcada como principal.
 *     tags:
 *       - Billetera
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuarioId:
 *                 type: string
 *                 description: El ID del usuario que desea establecer una tarjeta principal.
 *                 example: "605c72ef153207001f72a0b"
 *               tarjetaId:
 *                 type: string
 *                 description: El ID de la tarjeta que se marcará como principal.
 *                 example: "603d9e35f8db3e1a1c85e73c"
 *     responses:
 *       200:
 *         description: La tarjeta fue marcada exitosamente como principal.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica si la operación fue exitosa.
 *                   example: true
 *                 tarjetaPrincipal:
 *                   type: object
 *                   description: Detalles de la tarjeta marcada como principal.
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: El ID de la tarjeta.
 *                       example: "603d9e35f8db3e1a1c85e73c"
 *                     principal:
 *                       type: boolean
 *                       description: Si la tarjeta es ahora la principal.
 *                       example: true
 *                     saldo:
 *                       type: number
 *                       description: El saldo de la tarjeta.
 *                       example: 1000
 *       400:
 *         description: Faltan parámetros necesarios en la solicitud (usuarioId o tarjetaId).
 *       404:
 *         description: No se encontraron tarjetas para el usuario o la tarjeta no fue encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/tarjetas/set-principal', async(req, res) => {
    const { usuarioId, tarjetaId } = req.body;

    if (!usuarioId || !tarjetaId) {
        return res.status(400).json({ error: 'Faltan parámetros' });
    }

    try {
        const tarjetasActualizadas = await tarjetasVirtualesSchema.updateOne({ idUsuario: usuarioId, principal: true }, { $set: { principal: false } });

        if (tarjetasActualizadas.modifiedCount === 0) {
            console.log('1')
            return res.status(404).json({ error: 'No se encontraron tarjetas para el usuario' });
        }

        const tarjetaPrincipal = await tarjetasVirtualesSchema.findByIdAndUpdate(
            tarjetaId, { $set: { principal: true } }, { new: true }
        );

        if (!tarjetaPrincipal) {
            console.log('2')
            return res.status(404).json({ error: 'Tarjeta no encontrada' });
        }

        return res.json({ success: true, tarjetaPrincipal });
    } catch (error) {
        console.error('Error al establecer la tarjeta principal:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.put('/tarjetas/virtual/:id', async(req, res) => {

})

router.put('/tarjetas/fisica/:id', async(req, res) => {

})

/**
 * @swagger
 * /wallet/bloquear-tarjeta/{tarjetaId}:
 *   put:
 *     summary: Bloquear o desbloquear una tarjeta virtual del usuario
 *     description: Permite a un usuario bloquear o desbloquear su tarjeta virtual. Si la tarjeta está activa, se bloquea. Si está inactiva, se activa.
 *     tags:
 *       - Billetera
 *     parameters:
 *       - in: path
 *         name: tarjetaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la tarjeta virtual a bloquear o desbloquear.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID del usuario dueño de la tarjeta.
 *     responses:
 *       200:
 *         description: Tarjeta bloqueada o desbloqueada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Solicitud incorrecta (faltan datos).
 *       404:
 *         description: Tarjeta no encontrada o no pertenece al usuario.
 *       500:
 *         description: Error interno del servidor.
 */
router.put("/bloquear-tarjeta/:tarjetaId", async(req, res) => {
    try {
        const { tarjetaId } = req.params;
        const { userId } = req.body; // Para verificar que el usuario es dueño de la tarjeta

        if (!tarjetaId || !userId) {
            return res.status(400).json({ error: "Tarjeta y usuario son requeridos" });
        }

        let tarjeta = await tarjetasVirtualesSchema.findOne({ _id: tarjetaId, idUsuario: userId });

        if (!tarjeta) {
            return res.status(404).json({ error: "Tarjeta no encontrada o no pertenece al usuario" });
        }

        // Alternar estado de la tarjeta (si está Activa -> Inactiva, si está Inactiva -> Activa)
        tarjeta.estadoUsuario = tarjeta.estadoUsuario === "Activa" ? "Inactiva" : "Activa";
        await tarjeta.save();

        res.json({
            success: true,
            message: `Tarjeta ${tarjeta.estadoUsuario === "Activa" ? "desbloqueada" : "bloqueada"} exitosamente`
        });

    } catch (error) {
        console.error("Error al actualizar el estado de la tarjeta:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

/**
 * @swagger
 * /wallet/eliminar-metodo-pago:
 *   delete:
 *     summary: Eliminar un método de pago del usuario
 *     description: Este endpoint elimina un método de pago guardado del usuario, tanto de su perfil en la base de datos como de Stripe.
 *     tags:
 *       - Billetera
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: El ID del usuario cuyo método de pago será eliminado.
 *                 example: "605c72ef153207001f72a0b"
 *               paymentMethodId:
 *                 type: string
 *                 description: El ID del método de pago que será eliminado.
 *                 example: "pm_1Hzd57J2Vdb5JSj88btTvnWy"
 *     responses:
 *       200:
 *         description: Método de pago eliminado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   description: Mensaje de confirmación.
 *                   example: "Método de pago eliminado exitosamente"
 *       400:
 *         description: Faltan parámetros necesarios en la solicitud (userId o paymentMethodId).
 *       404:
 *         description: Usuario no encontrado o el método de pago no existe.
 *       500:
 *         description: Error interno del servidor al intentar eliminar el método de pago.
 */
router.delete("/eliminar-metodo-pago", async(req, res) => {
    try {
        const { userId, paymentMethodId } = req.body;

        const usuario = await userSchema.findById(userId);
        if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

        usuario.metodosPago = usuario.metodosPago.filter(
            (metodo) => metodo.paymentMethodId !== paymentMethodId
        );
        await usuario.save();

        await stripe.paymentMethods.detach(paymentMethodId);

        res.json({ mensaje: "Método de pago eliminado exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar el método de pago" });
    }
});

/**
 * @swagger
 * /wallet/tarjeta/virtual/delete/{id}:
 *   delete:
 *     summary: Eliminar una tarjeta virtual
 *     description: Este endpoint elimina una tarjeta virtual del sistema.
 *     tags:
 *       - Billetera
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: El ID de la tarjeta virtual a eliminar.
 *         schema:
 *           type: string
 *           example: "605c72ef153207001f72a0b"
 *     responses:
 *       200:
 *         description: La tarjeta virtual fue eliminada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 acknowledged:
 *                   type: boolean
 *                   description: Indicador de si la operación fue exitosa.
 *                   example: true
 *                 deletedCount:
 *                   type: integer
 *                   description: Número de tarjetas eliminadas.
 *                   example: 1
 *       404:
 *         description: No se encontró la tarjeta virtual con el ID proporcionado.
 *       500:
 *         description: Error interno del servidor al intentar eliminar la tarjeta virtual.
 */
router.delete('/tarjeta/virtual/delete/:id', async(req, res) => {
    const id = req.params.id
    tarjetasVirtualesSchema
        .deleteOne({ _id: id })
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

router.delete('/tarjeta/fisica/:id', async(req, res) => {

})

module.exports = router;