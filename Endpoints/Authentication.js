const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const bcrypt = require('bcryptjs');
const sendResetEmail = require("../emailService");
const Stripe = require('stripe')


const app = express();
app.use(express.json());

const SECRET_KEY = process.env.JWT_SECRET || 'miClaveSecreta';
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

const userSchema = require('../models/Usuario');


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401); // No autorizado

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403); // Prohibido
        req.user = user;
        next();
    });
};


/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: Obtener todos los Usuarios
 *     description: Permite obtener un listado con todos los usuasrios activos o inactivos dentro de la aplicacion, limite su uso a acciones de rol administrativo.
 *     tags:
 *       - Autenticación | Usuarios
 *     responses:
 *       200:
 *         description: Lista de usuarios.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *       401:
 *         description: Error al encontrar los usuarios.
 *       500:
 *         description: Error en el servidor.
 */
router.get('/users', (req, res) => {
    userSchema
        .find()
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

/**
 * @swagger
 * /auth/users/id/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     description: Permite obtener la información de un usuario mediante su ID en la plataforma.
 *     tags:
 *       - Autenticación | Usuarios
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID del usuario que se desea obtener
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   nombre:
 *                     type: string
 *                   apellido:
 *                     type: string
 *                   correo:
 *                     type: string
 *                   userRol:
 *                     type: string
 *                   estadoUsuario:
 *                     type: string
 *                   fechaCreacion:
 *                     type: string
 *                     format: date-time
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error en el servidor.
 */
router.get('/users/id/:id', (req, res) => {
    const id = req.params.id
    userSchema
        .find({ _id: id })
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

/**
 * @swagger
 * /auth/users/nombre/{nombre}:
 *   get:
 *     summary: Obtener usuarios por nombre
 *     description: Permite obtener la lista de usuarios cuyo nombre coincida parcialmente con el valor proporcionado.
 *     tags:
 *       - Autenticación | Usuarios
 *     parameters:
 *       - name: nombre
 *         in: path
 *         description: Nombre del usuario que se desea buscar.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de usuarios encontrados.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   nombre:
 *                     type: string
 *                   apellido:
 *                     type: string
 *                   correo:
 *                     type: string
 *                   userRol:
 *                     type: string
 *                   estadoUsuario:
 *                     type: string
 *                   fechaCreacion:
 *                     type: string
 *                     format: date-time
 *       404:
 *         description: No se encontraron usuarios con ese nombre.
 *       500:
 *         description: Error en el servidor.
 */
router.get('/users/nombre/:nombre', (req, res) => {
    const nombre = req.params.nombre
    userSchema
        .find({ nombre: { $regex: nombre, $options: "i" } })
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

/**
 * @swagger
 * /auth/users/add:
 *   post:
 *     summary: Registro de usuario y login automático
 *     description: Permite a un usuario registrarse en la plataforma y obtener automáticamente un token de autenticación.
 *     tags:
 *       - Autenticación | Usuarios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Usuario Ejemplo"
 *               correo:
 *                 type: string
 *                 example: "usuario@email.com"
 *               contraseña:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Registro exitoso y login automático.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Registro exitoso"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUz..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "65b6f3a2c5e4e12f8a4b7d32"
 *                     nombre:
 *                       type: string
 *                       example: "Usuario Ejemplo"
 *                     correo:
 *                       type: string
 *                       example: "usuario@email.com"
 *                     userRol:
 *                       type: string
 *                       example: "usuario"
 *       400:
 *         description: El usuario ya existe.
 *       500:
 *         description: Error en el servidor.
 */
router.post('/users/add', async(req, res) => {
    try {
        const { nombre, correo, contraseña, userImage, userRole } = req.body;

        const existingUser = await userSchema.findOne({ correo });
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        const clienteStripe = await stripe.customers.create({ name: nombre, email: correo });

        const newUser = new userSchema({
            nombre,
            correo: correo.toLowerCase(),
            contraseña,
            userRol: userRole,
            userImage,
            estadoUsuario: "activo",
            customerId: clienteStripe.id,
            tema: "light",
            lastLogin: new Date(),
        });

        await newUser.save();

        const payload = {
            id: newUser._id,
            nombre: newUser.nombre,
            correo: newUser.correo,
            userRol: newUser.userRol,
            userImage: newUser.userImage,
            theme: newUser.tema,
            estadoUsuario: newUser.estadoUsuario,
            customerId: newUser.customerId,
            lastLogin: newUser.lastLogin,
        };

        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '5h' });

        res.status(201).json({
            message: 'Registro exitoso',
            token,
            user: {
                id: newUser._id,
                nombre: newUser.nombre,
                correo: newUser.correo,
                userRol: newUser.userRol,
                customerId: newUser.customerId,
                theme: newUser.tema,
            }
        });

    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            return res.status(400).json({ message: "El correo ya está registrado" });
        }

        res.status(500).json({ message: 'Error en el servidor', error });
    }
});


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Permite a un usuario autenticarse en la plataforma.
 *     tags:
 *       - Autenticación | Usuarios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               correo:
 *                 type: string
 *                 example: usuario@email.com
 *               contraseña:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login exitoso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login exitoso"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUz..."
 *       401:
 *         description: Credenciales incorrectas o usuario suspendido.
 *       500:
 *         description: Error en el servidor.
 */
router.post('/login', async(req, res) => {
    const { correo, contraseña } = req.body;
    const email = correo.toLowerCase()

    try {

        const user = await userSchema.findOne({ correo: { $regex: email, $options: "i" } });
        if (!user) {
            return res.status(401).json({ message: 'Usuario no encontrado' });

        }
        if (user.estadoUsuario == 'suspendido') {
            return res.status(401).json({ message: 'Acceso denegado' });
        }

        const isPasswordValid = await bcrypt.compare(contraseña, user.contraseña);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }


        const payload = {
            id: user._id,
            nombre: user.nombre,
            correo: user.correo,
            userRol: user.userRol,
            userImage: user.userImage,
            estadoUsuario: user.estadoUsuario,
            theme: user.tema,
            lastLogin: user.lastLogin
        }


        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '5h' });

        res.json({ message: 'Login exitoso', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor', error });
    }
});

/**
 * @swagger
 * /auth/users/send-otp:
 *   post:
 *     summary: Enviar un código OTP al correo electrónico
 *     description: Este endpoint genera un código OTP y lo envía al correo electrónico proporcionado para verificación.
 *     tags:
 *       - Autenticación | Usuarios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: "usuario@ejemplo.com"
 *     responses:
 *       200:
 *         description: Código OTP enviado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Código enviado correctamente"
 *                 otp:
 *                   type: integer
 *                   example: 123456
 *       400:
 *         description: El correo electrónico es requerido.
 *       404:
 *         description: El correo electrónico no está registrado.
 *       500:
 *         description: Error enviando el correo.
 */
router.post('/send-otp', async(req, res) => {
    const { correo } = req.body;



    if (!correo) {
        return res.status(400).json({ message: "El email es requerido" });
    }

    try {
        const user = await userSchema.findOne({ correo: correo.toLowerCase() })

        if (!user) {
            return res.status(404).json({ message: "El correo electrónico no está registrado" });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000);
        console.log("OTP generado:", otpCode);

        user.otpCode = otpCode;
        user.otpTimestamp = Date.now();

        await user.save();

        await sendResetEmail(correo, "Código de verificación", otpCode);
        res.status(200).json({ message: "Código enviado correctamente", otp: otpCode });

    } catch (error) {
        res.status(500).json({ message: "Error enviando el correo" });
    }
});

/**
 * @swagger
 * /auth/users/confirm-otp:
 *   post:
 *     summary: Confirmar el código OTP
 *     description: Este endpoint valida el código OTP enviado previamente para permitir al usuario continuar con el proceso de recuperación de contraseña.
 *     tags:
 *       - Autenticación | Usuarios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: "usuario@ejemplo.com"
 *               otpCode:
 *                 type: integer
 *                 example: 123456
 *     responses:
 *       200:
 *         description: OTP verificado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP verificado correctamente. Ahora puedes cambiar tu contraseña."
 *       400:
 *         description: Faltan datos requeridos o el OTP es incorrecto o ha expirado.
 *       404:
 *         description: El correo electrónico no está registrado.
 *       500:
 *         description: Error al confirmar el OTP.
 */
router.post('/confirm-otp', async(req, res) => {
    const { correo, otpCode } = req.body;

    if (!correo || !otpCode) {
        console.log(req.body)
        return res.status(400).json({ message: 'Faltan datos requeridos' })
    }

    try {
        const user = await userSchema.findOne({ correo: correo.toLowerCase() });

        if (!user) {
            return res.status(404).json({ message: "El correo electrónico no está registrado" });
        }

        if (otpCode !== user.otpCode) {
            return res.status(400).json({ message: "El código OTP es incorrecto" });
        }

        const currentTime = Date.now();
        if (currentTime - user.otpTimestamp > 900000) {
            return res.status(400).json({ message: "El código OTP ha expirado" });
        }

        res.status(200).json({ message: "OTP verificado correctamente. Ahora puedes cambiar tu contraseña." });

    } catch (error) {
        console.error("Error al confirmar el OTP:", error);
        res.status(500).json({ message: "Error al confirmar el OTP" });
    }
})

/**
 * @swagger
 * /auth/users/password/change:
 *   put:
 *     summary: Cambiar la contraseña de un usuario
 *     description: Este endpoint permite a un usuario cambiar su contraseña después de haber confirmado el código OTP.
 *     tags:
 *       - Autenticación | Usuarios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: "usuario@ejemplo.com"
 *               contraseña:
 *                 type: string
 *                 example: "nuevaContraseña123"
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contraseña actualizada exitosamente"
 *       400:
 *         description: Faltan datos requeridos.
 *       404:
 *         description: El correo electrónico no está registrado.
 *       500:
 *         description: Error al cambiar la contraseña.
 */
router.put('/users/password/change', async(req, res) => {
    const { correo, contraseña } = req.body

    if (!correo || !contraseña) {
        return res.status(400).json({ message: 'Faltan datos requeridos.' })
    }

    try {
        const user = await userSchema.findOne({ correo: correo.toLowerCase() });

        if (!user) {
            return res.status(404).json({ message: "El correo electrónico no está registrado" });
        }

        const hashedPassword = await bcrypt.hash(contraseña, 10);
        user.contraseña = hashedPassword;
        user.otpCode = null;
        user.otpTimestamp = null;

        await userSchema.updateOne({ correo: correo.toLowerCase() }, { $set: { contraseña: hashedPassword, otpCode: null, otpTimestamp: null } });

        res.status(200).json({ message: "Contraseña actualizada exitosamente" });
    } catch (error) {
        console.error("Error al cambiar la contraseña:", error);
        res.status(500).json({ message: "Error al cambiar la contraseña" });
    }

})

/**
 * @swagger
 * /auth/users/put/{id}:
 *   put:
 *     summary: Actualizar un usuario
 *     description: Permite modificar la información de un usuario existente mediante su ID.
 *     tags:
 *       - Autenticación | Usuarios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario a actualizar.
 *         schema:
 *           type: string
 *           example: "65b6f3a2c5e4e12f8a4b7d32"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Juan"
 *               apellido:
 *                 type: string
 *                 example: "Pérez"
 *               userRol:
 *                 type: string
 *                 enum: ["Pasajero", "Operador", "Administrador"]
 *                 example: "Operador"
 *               estadoUsuario:
 *                 type: string
 *                 enum: ["activo", "suspendido"]
 *                 example: "activo"
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario actualizado con éxito"
 *       400:
 *         description: Error en los datos enviados.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error en el servidor.
 */
router.put('/users/put/:id', async(req, res) => {
    try {
        const id = req.params.id;
        const { nombre, apellido, userRol, estadoUsuario, userImage } = req.body;

        // Verifica que el usuario exista antes de actualizarlo
        const usuarioExistente = await userSchema.findById(id);
        if (!usuarioExistente) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Actualizar los campos permitidos
        const updateFields = {
            nombre,
            apellido,
            userRol,
            userImage,
            estadoUsuario,
            fechaModificacion: Date.now() // Actualiza automáticamente la fecha de modificación
        };

        const resultado = await userSchema.findByIdAndUpdate(id, updateFields, { new: true });

        const payload = {
            id: usuarioExistente._id,
            nombre: usuarioExistente.nombre,
            correo: usuarioExistente.correo,
            userRol: usuarioExistente.userRol,
            userImage: usuarioExistente.userImage,
            estadoUsuario: usuarioExistente.estadoUsuario,
            theme: usuarioExistente.tema,
            lastLogin: usuarioExistente.lastLogin
        }

        const newToken = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" } // O el tiempo que prefieras
        );

        res.json({ message: "Usuario actualizado con éxito", token: newToken });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error en el servidor", error });
    }
});

/**
 * @swagger
 * /auth/users/put/theme:
 *   put:
 *     summary: Actualizar el tema de un usuario
 *     description: Permite modificar el tema preferido de un usuario en la base de datos y devuelve un nuevo token con el tema actualizado.
 *     tags:
 *       - Autenticación | Usuarios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID del usuario a actualizar.
 *                 example: "65b6f3a2c5e4e12f8a4b7d32"
 *               theme:
 *                 type: string
 *                 description: Tema preferido del usuario.
 *                 enum: ["light", "dark"]
 *                 example: "dark"
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente y nuevo token generado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Theme actualizado con éxito"
 *                 token:
 *                   type: string
 *                   description: Nuevo token con el tema actualizado.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Error en los datos enviados.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error en el servidor.
 */
router.put('/users/put/theme/:id', async(req, res) => {
    try {
        const id = req.params.id
        const { theme } = req.body;

        const usuarioExistente = await userSchema.findById(id);
        if (!usuarioExistente) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Actualizar el theme en la base de datos
        usuarioExistente.tema = theme;
        usuarioExistente.fechaModificacion = Date.now();
        await usuarioExistente.save();

        const payload = {
            id: usuarioExistente._id,
            nombre: usuarioExistente.nombre,
            correo: usuarioExistente.correo,
            userRol: usuarioExistente.userRol,
            userImage: usuarioExistente.userImage,
            estadoUsuario: usuarioExistente.estadoUsuario,
            theme: usuarioExistente.tema,
            lastLogin: usuarioExistente.lastLogin
        }

        // Crear un nuevo token con el theme actualizado
        const newToken = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" } // O el tiempo que prefieras
        );

        res.json({ message: "Theme actualizado con éxito", token: newToken });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error en el servidor", error });
    }
});


// /**
//  * @swagger
//  * /auth/users/password/update/{id}:
//  *   put:
//  *     summary: Actualizar contraseña de un usuario
//  *     description: Permite actualizar la contraseña de un usuario en la plataforma.
//  *     tags:
//  *       - Autenticación | Usuarios
//  *     parameters:
//  *       - name: id
//  *         in: path
//  *         description: ID del usuario cuya contraseña será actualizada
//  *         required: true
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               contraseña:
//  *                 type: string
//  *                 example: "nuevacontraseña123"
//  *     responses:
//  *       200:
//  *         description: Contraseña actualizada correctamente.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: "Contraseña actualizada exitosamente."
//  *       400:
//  *         description: Error en la solicitud, posiblemente la contraseña no fue proporcionada correctamente.
//  *       404:
//  *         description: Usuario no encontrado.
//  *       500:
//  *         description: Error en el servidor.
//  */
// router.put('/users/password/update/:id', async(req, res) => {
//     const id = req.params.id
//     const {
//         contraseña
//     } = userSchema(req.body)
//     const hashedPassword = await bcrypt.hash(contraseña, 10);
//     userSchema
//         .updateOne({ _id: id }, {
//             $set: {
//                 contraseña: hashedPassword,
//                 fechaModificacion: new Date()
//             }
//         })
//         .then((data) => {
//             res.json(data)
//         })
//         .catch((error) => {
//             console.error(error)
//         })
// })

/**
 * @swagger
 * /auth/users/delete/{id}:
 *   delete:
 *     summary: Eliminar un usuario
 *     description: Permite eliminar un usuario de la base de datos mediante su ID. Solo accesible para administradores.
 *     tags:
 *       - Autenticación | Usuarios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario a eliminar.
 *         schema:
 *           type: string
 *           example: "65b6f3a2c5e4e12f8a4b7d32"
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario eliminado correctamente"
 *                 deletedCount:
 *                   type: integer
 *                   example: 1
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error en el servidor.
 */
router.delete('/users/delete/:id', (req, res) => {
    const id = req.params.id
    userSchema
        .deleteOne({ _id: id })
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

module.exports = router;