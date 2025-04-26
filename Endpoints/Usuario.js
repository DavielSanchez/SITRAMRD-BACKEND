const router = require('express').Router();
const verificarRol = require('../middleware/verificarRol');
const userSchema = require('../models/Usuario');
const RutaSchema = require('../models/Ruta');

/**
 * @swagger
 * /usuario/asignar/{id}/{rol}:
 *   put:
 *     summary: Asignar un rol a un usuario
 *     description: Permite asignar o cambiar el rol de un usuario existente. Solo accesible para usuarios con rol de Administrador.
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario al que se le asignará el rol
 *         schema:
 *           type: string
 *           example: "64b7d8f123e4b4c123f5a6b7"
 *       - in: path
 *         name: rol
 *         required: true
 *         description: Rol a asignar. Debe ser 'Administrador', 'Pasajero' o 'Operador'
 *         schema:
 *           type: string
 *           enum: [Administrador, Pasajero, Operador]
 *           example: "Operador"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rol asignado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "El usuario ha sido actualizado con éxito"
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: ID del usuario
 *                       example: "64b7d8f123e4b4c123f5a6b7"
 *                     nombre:
 *                       type: string
 *                       description: Nombre del usuario
 *                       example: "Juan Pérez"
 *                     userRol:
 *                       type: string
 *                       description: Rol actual del usuario
 *                       example: "Operador"
 *       400:
 *         description: Solicitud incorrecta debido a datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Especifica un rol válido: 'Administrador', 'Pasajero', 'Operador'"
 *       404:
 *         description: No se encuentra el usuario en la base de datos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No se encuentra el usuario en la base de datos"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error en el servidor"
 *                 error:
 *                   type: string
 *                   example: "Detalles del error"
 */
router.put('/asignar/:id/:rol', verificarRol(["Administrador"]), async(req, res) => {
    try {
        const { id: userId, rol } = req.params;
        const rolesValidos = ["Administrador", "Pasajero", "Operador"];

        if (!rol) {
            return res.status(400).json({ message: "Especifica un rol válido: 'Administrador', 'Pasajero', 'Operador'" });
        }

        if (!rolesValidos.includes(rol)) {
            return res.status(400).json({ message: "Rol inválido. Debe ser 'Administrador', 'Pasajero' o 'Operador'" });
        }

        const usuario = await userSchema.findById(userId);
        if (!usuario) {
            return res.status(404).json({ message: "No se encuentra el usuario en la base de datos" });
        }

        if (usuario.userRol === rol) {
            return res.status(400).json({ message: "Este usuario ya tiene este rol asignado" });
        }

        usuario.userRol = rol;
        await usuario.save();

        return res.status(200).json({ message: "El usuario ha sido actualizado con éxito", usuario });

    } catch (error) {
        return res.status(500).json({ message: "Hubo un error en el servidor", error });
    }
});

/**
 * @swagger
 * /usuario/operadores:
 *   get:
 *     summary: Obtener lista de usuarios con rol de Operador
 *     description: Permite obtener una lista de todos los usuarios que tienen asignado el rol de "Operador". Si no hay ningún usuario con ese rol, se devuelve un mensaje indicándolo. Solo accesible para usuarios con rol de Administrador.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de operadores obtenida con éxito o mensaje indicando que no hay operadores
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     operadores:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: ID del operador
 *                             example: "64b7d8f123e4b4c123f5a6b7"
 *                           nombre:
 *                             type: string
 *                             description: Nombre del operador
 *                             example: "Carlos López"
 *                           email:
 *                             type: string
 *                             description: Correo electrónico del operador
 *                             example: "carlos.lopez@example.com"
 *                           userRol:
 *                             type: string
 *                             description: Rol del usuario
 *                             example: "Operador"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "No hay ningun usuario con el rango Operador"
 *       401:
 *         description: No autorizado. Se requiere rol de Administrador.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No autorizado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error en el servidor"
 *                 error:
 *                   type: string
 *                   example: "Detalles del error"
 */
router.get('/operadores', verificarRol(["Administrador"]), async(req, res) => {
    try {
        const operadores = await userSchema.find({ userRol: "Operador" });
        if (operadores.length === 0) {
            return res.status(200).json({ message: "No hay ningun usuario con el rango Operador" })
        }
        return res.status(200).json({ operadores });
    } catch (err) {
        return res.status(500).json({ message: "Hubo un error en el servidor", error: err.message });
    }
});

router.post('/asignar/ruta', async(req, res) => {
    try {
        const { id, idRuta } = req.body;

        if (!id) {
            return res.status(404).json({ message: "No proporcionaste un usuario" });
        }

        if (!idRuta) {
            return res.status(404).json({ message: "No proporcionaste una ruta" })
        }

        const consulta = await RutaSchema.findById(idRuta);
        const usuario = await userSchema.findById(id);

        if (!consulta) {
            return res.status(404).json({ message: "Ruta inexsitente" })
        }

        if (!usuario) {
            return res.status(404).json({ message: "No es un usuario valido" })
        }

        if (!usuario.rutasAsignadas.includes(consulta._id)) {
            usuario.rutasAsignadas.push(consulta._id);
            await usuario.save();
        }

        res.status(200).json({ message: "Ruta agregada con exito", usuario });

    } catch (err) {
        return res.status(500).json({ message: "error en el server", err })
    }
})

router.delete('/ruta/quitar/:idUsuario/:idRuta', async(req, res) => {
    try {
        const { idUsuario, idRuta } = req.params;

        const usuario = await userSchema.findById(idUsuario);
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        usuario.rutasAsignadas = usuario.rutasAsignadas.filter(
            ruta => ruta.toString() !== idRuta
        );
        await usuario.save();

        res.status(200).json({ message: "Ruta removida exitosamente del usuario", usuario });
    } catch (error) {
        console.error("Error al quitar la ruta:", error);
        res.status(500).json({ message: "Error del servidor", error });
    }
});

module.exports = router;