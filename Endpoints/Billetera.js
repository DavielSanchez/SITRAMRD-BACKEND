const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const Stripe = require('stripe')
const bodyParser = require("body-parser");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
const stripe_webhook_secret = process.env.STRIPE_WEBHOOK_SECRET

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
router.post('/webhook-stripe', express.raw({ type: 'application/json' }), async(req, res) => {
    console.log('Webhook recibido');
    const sig = req.headers['stripe-signature'];

    console.log('Tipo de body:', typeof req.body);
    console.log('Cuerpo:', req.body);

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, stripe_webhook_secret);
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
            res.json({ success: true, transaccion });
        } catch (error) {
            console.error('❌ Error al actualizar la transacción:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    } else {
        console.log(`ℹ️ Evento no manejado: ${event.type}`);
        res.status(400).end();
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
        const { userId, paymentMethodId } = req.body;

        const usuario = await userSchema.findById(userId);
        if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

        await stripe.customers.update(usuario.customerId, {
            invoice_settings: { default_payment_method: paymentMethodId },
        });

        const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

        usuario.metodosPago.push({
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


/**
 * @swagger
 * /wallet/pagar:
 *   post:
 *     summary: Pagar un viaje en autobús/metro
 *     description: Descuenta saldo de la tarjeta virtual del usuario y registra la transacción.
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
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Pago exitoso.
 */
router.post("/pagar", async(req, res) => {
    try {
        const { userId, amount } = req.body;

        if (!userId || !amount) {
            return res.status(400).json({ error: "Usuario y monto son requeridos" });
        }

        let tarjeta = await tarjetasVirtualesSchema.findOne({ idUsuario: userId });
        if (!tarjeta || tarjeta.saldo < amount) {
            return res.status(400).json({ error: "Saldo insuficiente" });
        }

        tarjeta.saldo -= amount;
        await tarjeta.save();

        const transaccion = new tarjetaTransaccionesSchema({
            idUsuario: userId,
            tarjetaVirtual: tarjeta._id,
            tipo: "Pago",
            monto: amount,
            estado: "Completado",
        });
        await transaccion.save();

        res.json({ success: true, saldoActual: tarjeta.saldo });
    } catch (error) {
        console.error("Error en pago:", error);
        res.status(500).json({ error: "Error interno del servidor" });
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


router.put('/tarjetas/virtual/:id', async(req, res) => {

})

router.put('/tarjetas/fisica/:id', async(req, res) => {

})

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

router.delete('/tarjeta/virtual/:id', async(req, res) => {

})

router.delete('/tarjeta/fisica/:id', async(req, res) => {

})

module.exports = router;