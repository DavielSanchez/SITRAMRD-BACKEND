const express = require("express");
const router = express.Router();
const IncidenciaSchema = require("../models/Incidencias");
/**
 * @swagger
 * /incidencia/add:
 *   post:
 *     summary: Registrar una incidencia
 *     description: Permite a un operador o administrador registrar una incidencia asociada a un autobús. El estado de la incidencia será "Pendiente" por defecto.
 *     tags: [Incidencias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *                 description: Descripción detallada de la incidencia
 *                 example: "Autobús con retraso debido a condiciones climáticas."
 *               idAutoBus:
 *                 type: string
 *                 description: ID del autobús asociado a la incidencia
 *                 example: "605c72ef1532071b7c8c8a12"
 *               idUsuario:
 *                 type: string
 *                 description: ID del usuario que reporta la incidencia
 *                 example: "67b569f4ce5b1cf866357f0e"
 *     responses:
 *       201:
 *         description: Incidencia registrada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Incidencia registrada correctamente"
 *                 incidencia:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: ID único de la incidencia
 *                       example: "67b591cd574aedd15c75629b"
 *                     descripcion:
 *                       type: string
 *                       description: Descripción de la incidencia
 *                       example: "Autobús con retraso debido a condiciones climáticas."
 *                     idAutoBus:
 *                       type: string
 *                       description: ID del autobús asociado a la incidencia
 *                       example: "605c72ef1532071b7c8c8a12"
 *                     idUsuario:
 *                       type: string
 *                       description: ID del usuario que registró la incidencia
 *                       example: "67b569f4ce5b1cf866357f0e"
 *                     estado:
 *                       type: string
 *                       description: Estado de la incidencia (por defecto es "Pendiente")
 *                       example: "Pendiente"
 *                     fechaDeReporte:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha y hora en que se registró la incidencia
 *                       example: "2025-02-19T08:07:36.456Z"
 *       400:
 *         description: Parámetros incorrectos o faltantes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Faltan parámetros requeridos: descripcion, idAutoBus o idUsuario"
 *       500:
 *         description: Error en el servidor al procesar la solicitud
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
 *                   example: "Error al registrar la incidencia"
 */


router.post('/add', async (req, res) => {
    try {
        const { descripcion, idAutoBus, idUsuario } = req.body;

        if (!descripcion || !idAutoBus || !idUsuario) {
            return res.status(400).json({ message: "Faltan parámetros requeridos: descripcion, idAutoBus o idUsuario" });
        }

        const nuevaIncidencia = new IncidenciaSchema({
            descripcion,
            idAutoBus,
            idUsuario,
            estado: 'Pendiente', // Estado por defecto
            fechaDeReporte: Date.now()
        });

        await nuevaIncidencia.save();

        res.status(201).json({ 
            message: "Incidencia registrada correctamente",
            incidencia: nuevaIncidencia
        });

    } catch (err) {
        res.status(500).json({ 
            message: "Hubo un error en el servidor",
            error: err.message 
        });
    }
});


/**
 * @swagger
 * /incidencia/estado/{id}:
 *   put:
 *     summary: Modificar el estado de una incidencia
 *     description: Permite modificar el estado de una incidencia especificada por su ID.
 *     tags: [Incidencias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la incidencia que se desea actualizar.
 *         schema:
 *           type: string
 *           example: "60f4e3b4d8b9b40015c68409"
 *       - in: body
 *         name: estado
 *         required: true
 *         description: Nuevo estado para la incidencia.
 *         schema:
 *           type: object
 *           properties:
 *             estado:
 *               type: string
 *               description: Estado de la incidencia (puede ser 'Pendiente', 'Resuelto', 'En Proceso', etc.)
 *               example: "Resuelto"
 *     responses:
 *       200:
 *         description: Estado de la incidencia actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Estado de la incidencia actualizado correctamente"
 *                 incidencia:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: ID de la incidencia
 *                       example: "60f4e3b4d8b9b40015c68409"
 *                     descripcion:
 *                       type: string
 *                       description: Descripción de la incidencia
 *                       example: "Autobús con retraso debido a condiciones climáticas."
 *                     estado:
 *                       type: string
 *                       description: Estado actual de la incidencia
 *                       example: "Resuelto"
 *                     fechaDeReporte:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha en que se reportó la incidencia
 *                       example: "2025-02-19T14:30:00.000Z"
 *       400:
 *         description: Faltan parámetros requeridos o el parámetro "estado" no está presente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Falta el parámetro "estado".'
 *       404:
 *         description: Incidencia no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Incidencia no encontrada.'
 *       500:
 *         description: Error en el servidor
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
 *                   example: "Error de conexión a la base de datos"
 */
router.put('/estado/:id', async(req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!estado) {
            return res.status(400).json({ message: 'Falta el parámetro "estado".' });
        }

        const incidencia = await IncidenciaSchema.findById(id);

        if (!incidencia) {
            return res.status(404).json({ message: 'Incidencia no encontrada.' });
        }

        incidencia.estado = estado;

        await incidencia.save();

        res.status(200).json({ message: "Estado de la incidencia actualizado correctamente", incidencia });

    } catch (err) {
        res.status(500).json({ message: "Hubo un error en el servidor", err });
    }
});

/**
 * @swagger
 * /incidencia/{id}:
 *   delete:
 *     summary: Eliminar una incidencia
 *     description: Permite eliminar una incidencia especificada por su ID.
 *     tags: [Incidencias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la incidencia que se desea eliminar.
 *         schema:
 *           type: string
 *           example: "60f4e3b4d8b9b40015c68409"
 *     responses:
 *       200:
 *         description: Incidencia eliminada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Incidencia eliminada correctamente"
 *       404:
 *         description: Incidencia no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Incidencia no encontrada.'
 *       500:
 *         description: Error en el servidor
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
 *                   example: "Error de conexión a la base de datos"
 */
router.delete('/:id', async(req, res) => {
    try {
        const { id } = req.params;

        // Buscar y eliminar la incidencia
        const incidencia = await IncidenciaSchema.findByIdAndDelete(id);

        if (!incidencia) {
            return res.status(404).json({ message: 'Incidencia no encontrada.' });
        }

        res.status(200).json({ message: "Incidencia eliminada correctamente" });

    } catch (err) {
        res.status(500).json({ message: "Hubo un error en el servidor", err });
    }
});

/**
 * @swagger
 * /incidencia/all:
 *   get:
 *     summary: Obtener todas las incidencias
 *     description: Devuelve una lista de todas las incidencias en el sistema.
 *     tags: [Incidencias]
 *     responses:
 *       200:
 *         description: Lista de incidencias
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 incidencias:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: ID único de la incidencia
 *                         example: "60f4e3b4d8b9b40015c68409"
 *                       descripcion:
 *                         type: string
 *                         description: Descripción de la incidencia
 *                         example: "Autobús con retraso debido a condiciones climáticas."
 *                       idAutobus:  # Cambiado de idRuta a idAutobus
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: ID del autobús asociado
 *                             example: "605c72ef1532071b7c8c8a12"
 *                           placa:
 *                             type: string
 *                             description: Placa del autobús asociado
 *                             example: "ABC123"
 *                       idUsuario:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: ID del usuario que registró la incidencia
 *                             example: "60f4e3b4d8b9b40015c68408"
 *                           nombre:
 *                             type: string
 *                             description: Nombre del usuario que registró la incidencia
 *                             example: "Juan Pérez"
 *                           correo:
 *                             type: string
 *                             description: Correo del usuario que registró la incidencia
 *                             example: "juan.perez@email.com"
 *                       estado:
 *                         type: string
 *                         description: Estado de la incidencia (Pendiente, Resuelto, etc.)
 *                         example: "Pendiente"
 *                       fechaDeReporte:
 *                         type: string
 *                         format: date-time
 *                         description: Fecha en que se reportó la incidencia
 *                         example: "2025-02-19T14:30:00.000Z"
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error al obtener las incidencias"
 *                 error:
 *                   type: string
 *                   example: "Error de conexión a la base de datos"
 */
router.get('/all', async(req, res) => {
    try {
        const incidencias = await IncidenciaSchema.find()
            .populate('idUsuario', 'nombre correo')
            .populate('idAutoBus', 'placa')
            .sort({ fechaDeReporte: -1 });
        res.status(200).json({ incidencias });
    } catch (err) {
        res.status(500).json({ message: 'Hubo un error al obtener las incidencias', err });
    }
});



//http://localhost:3001/incidencia/reporte?fechaInicio=2025-02-01&fechaFin=2025-02-19&estado=Pendiente


/**
 * @swagger
 * /incidencia/reporte:
 *   get:
 *     summary: Generar un reporte de incidencias 
 *     description: Permite generar un reporte de incidencias filtrado por fecha y estado.
 *     tags: [Incidencias]
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         required: false
 *         description: Fecha de inicio para el filtro de incidencias.
 *         schema:
 *           type: string
 *           example: "2025-02-01"
 *       - in: query
 *         name: fechaFin
 *         required: false
 *         description: Fecha de fin para el filtro de incidencias.
 *         schema:
 *           type: string
 *           example: "2025-02-19"
 *       - in: query
 *         name: estado
 *         required: false
 *         description: Estado de la incidencia (puede ser 'Pendiente', 'Resuelto', 'En Proceso', etc.).
 *         schema:
 *           type: string
 *           example: "Pendiente"
 *     responses:
 *       200:
 *         description: Reporte de incidencias generado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 incidencias:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: ID único de la incidencia
 *                         example: "60f4e3b4d8b9b40015c68409"
 *                       descripcion:
 *                         type: string
 *                         description: Descripción de la incidencia
 *                         example: "Autobús con retraso debido a condiciones climáticas."
 *                       idAutobus:  # Cambiado de idRuta a idAutobus
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: ID del autobús asociado
 *                             example: "605c72ef1532071b7c8c8a12"
 *                           placa:
 *                             type: string
 *                             description: Placa del autobús asociado
 *                             example: "ABC123"
 *                       idUsuario:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: ID del usuario que registró la incidencia
 *                             example: "60f4e3b4d8b9b40015c68408"
 *                           nombre:
 *                             type: string
 *                             description: Nombre del usuario que registró la incidencia
 *                             example: "Juan Pérez"
 *                           correo:
 *                             type: string
 *                             description: Correo del usuario que registró la incidencia
 *                             example: "juan.perez@email.com"
 *                       estado:
 *                         type: string
 *                         description: Estado actual de la incidencia (Pendiente, Resuelto, etc.)
 *                         example: "Pendiente"
 *                       fechaDeReporte:
 *                         type: string
 *                         format: date-time
 *                         description: Fecha en que se reportó la incidencia
 *                         example: "2025-02-19T14:30:00.000Z"
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hubo un error al generar el reporte"
 *                 error:
 *                   type: string
 *                   example: "Error de conexión a la base de datos"
 */
router.get('/reporte', async(req, res) => {
    try {
        const { fechaInicio, fechaFin, estado } = req.query;

        const query = {};
        if (fechaInicio) query.fechaDeReporte = { $gte: new Date(fechaInicio) };
        if (fechaFin) query.fechaDeReporte = { $lte: new Date(fechaFin) };
        if (estado) query.estado = estado;

        const incidencias = await IncidenciaSchema.find(query)
            .populate('idUsuario', 'nombre correo')
            .populate('idAutobus', 'placa'); // Cambiado de idRuta a idAutobus

        res.status(200).json({ incidencias });

    } catch (err) {
        res.status(500).json({ message: 'Hubo un error al generar el reporte', err });
    }
});

module.exports = router;