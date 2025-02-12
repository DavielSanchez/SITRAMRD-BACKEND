const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const bcrypt = require('bcryptjs');

const SECRET_KEY = process.env.JWT_SECRET || 'miClaveSecreta';

const userSchema = require('../Models/Usuario');


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
        const { nombre, correo, contraseña } = req.body;

        const existingUser = await userSchema.findOne({ correo });
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        const newUser = new userSchema({
            nombre,
            correo,
            contraseña,
            userRol: "Pasajero",
            estadoUsuario: "activo",
            lastLogin: new Date(),
        });

        await newUser.save();

        const payload = {
            id: newUser._id,
            nombre: newUser.nombre,
            correo: newUser.correo,
            userRol: newUser.userRol,
            estadoUsuario: newUser.estadoUsuario,
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
            }
        });

    } catch (error) {
        console.error(error);
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

    try {

        const user = await userSchema.findOne({ correo });
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
            estadoUsuario: user.estadoUsuario,
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
        const { nombre, apellido, userRol, estadoUsuario } = req.body;

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
            estadoUsuario,
            fechaModificacion: Date.now() // Actualiza automáticamente la fecha de modificación
        };

        const resultado = await userSchema.findByIdAndUpdate(id, updateFields, { new: true });

        res.json({ message: "Usuario actualizado con éxito", usuario: resultado });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error en el servidor", error });
    }
});

/**
 * @swagger
 * /auth/users/password/update/{id}:
 *   put:
 *     summary: Actualizar contraseña de un usuario
 *     description: Permite actualizar la contraseña de un usuario en la plataforma.
 *     tags:
 *       - Autenticación | Usuarios
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID del usuario cuya contraseña será actualizada
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contraseña:
 *                 type: string
 *                 example: "nuevacontraseña123"
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contraseña actualizada exitosamente."
 *       400:
 *         description: Error en la solicitud, posiblemente la contraseña no fue proporcionada correctamente.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error en el servidor.
 */
router.put('/users/password/update/:id', async(req, res) => {
    const id = req.params.id
    const {
        contraseña
    } = userSchema(req.body)
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    userSchema
        .updateOne({ _id: id }, {
            $set: {
                contraseña: hashedPassword,
                fechaModificacion: new Date()
            }
        })
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})


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