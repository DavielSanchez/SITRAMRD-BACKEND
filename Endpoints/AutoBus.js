const express = require("express");
const router = express.Router();
const Autobus = require("../models/Autobus");
const RutaSchema = require("../models/Ruta");
const verificarRol = require("../middleware/verificarRol");
const verificarToken = require("../middleware/verificarToken")

/**
 * @swagger
 * /autobus/add:
 *   post:
 *     summary: Agregar un nuevo autobús
 *     description: Agrega un autobús con la información proporcionada.
 *     tags: [Autobus]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               placa:
 *                 type: string
 *                 example: "ABC123"
 *               modelo:
 *                 type: string
 *                 example: "Volvo B8R"
 *               capacidad:
 *                 type: string
 *                 example: "40"
 *               estado:
 *                 type: string
 *                 enum: [Activo, Inactivo]
 *                 example: "Activo"
 *               ubicacionActual:
 *                 type: string
 *                 example: "Terminal 1"
 *               idRuta:
 *                 type: string
 *                 example: "60c72b2f9c2c1d5d5f83a8a5"
 *             required:
 *               - placa
 *               - modelo
 *               - capacidad
 *               - estado
 *     responses:
 *       201:
 *         description: Autobús agregado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Autobús agregado con éxito"
 *                 autobus:
 *                   type: object
 *                   properties:
 *                     placa:
 *                       type: string
 *                       example: "ABC123"
 *                     modelo:
 *                       type: string
 *                       example: "Volvo B8R"
 *                     capacidad:
 *                       type: string
 *                       example: "40"
 *                     estado:
 *                       type: string
 *                       example: "Activo"
 *                     ubicacionActual:
 *                       type: string
 *                       example: "Terminal 1"
 *                     idRuta:
 *                       type: string
 *                       example: "60c72b2f9c2c1d5d5f83a8a5"
 *       400:
 *         description: Datos incorrectos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Faltan campos requeridos"
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al agregar el autobús"
 *                 error:
 *                   type: string
 *                   example: "Error al guardar en la base de datos"
 */
router.post("/add", verificarToken, verificarRol(["Administrador"]), async(req, res) => {
    try {
        const { placa, modelo, capacidad, estado, ubicacionActual, idRuta } = req.body;

        if (!placa || !modelo || !capacidad || !estado) {
            return res.status(400).json({ message: "Faltan campos requeridos" });
        }

        const nuevoAutobus = new Autobus({
            placa,
            modelo,
            capacidad,
            estado,
            ubicacionActual: ubicacionActual || '',
            idRuta: idRuta || null,
            fechaCreacion: Date.now()
        });

        await nuevoAutobus.save();

        res.status(201).json({ message: "Autobús agregado con éxito", autobus: nuevoAutobus });

    } catch (error) {
        console.error("Error al agregar el autobús:", error);
        res.status(500).json({ message: "Error al agregar el autobús", error: error.message });
    }
});


/**
 * @swagger
 * /autobus/asignar:
 *   post:
 *     summary: Asignar un autobús a una ruta
 *     description: Asigna un autobús a una ruta específica. Verifica que la ruta y el autobús existen, y que el autobús no esté ya asignado a otra ruta.
 *     tags: [Autobus]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rutaId:
 *                 type: string
 *                 description: ID de la ruta a la que se asignará el autobús
 *                 example: "605c72ef1532071b7c8c8a12"
 *               autobusId:
 *                 type: string
 *                 description: ID del autobús que se asignará a la ruta
 *                 example: "607c72ef1532071b7c8c8a13"
 *     responses:
 *       200:
 *         description: Autobús asignado correctamente a la ruta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Autobús asignado a la ruta correctamente"
 *                 ruta:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: ID único de la ruta
 *                       example: "605c72ef1532071b7c8c8a12"
 *                     nombreRuta:
 *                       type: string
 *                       description: Nombre de la ruta
 *                       example: "Ruta 1"
 *                     paradas:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Lista de paradas de la ruta
 *                       example: ["Parada 1", "Parada 2", "Parada 3"]
 *                     coordenadas:
 *                       type: array
 *                       items:
 *                         type: array
 *                         items:
 *                           type: number
 *                       description: Coordenadas de la ruta
 *                       example: [[19.432608, -99.133209], [19.434123, -99.134567]]
 *                     fechaCreacion:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha de creación de la ruta
 *                       example: "2025-02-19T07:21:26.922Z"
 *                 autoBus:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: ID único del autobús asignado
 *                       example: "607c72ef1532071b7c8c8a13"
 *                     modelo:
 *                       type: string
 *                       description: Modelo del autobús
 *                       example: "Autobús modelo X"
 *                     placas:
 *                       type: string
 *                       description: Placas del autobús
 *                       example: "ABC123"
 *                     capacidad:
 *                       type: integer
 *                       description: Capacidad del autobús
 *                       example: 50
 *                     idRuta:
 *                       type: string
 *                       description: ID de la ruta asignada al autobús
 *                       example: "605c72ef1532071b7c8c8a12"
 *       400:
 *         description: Autobús ya asignado a una ruta o datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Este autobús ya está asignado a una ruta"
 *       404:
 *         description: Ruta o autobús no encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ruta no encontrada"  # O "Autobus inexistente"
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error en el servidor"
 *                 error:
 *                   type: string
 *                   example: "Error al asignar el autobús a la ruta"
 */

router.post("/asignar", verificarToken, verificarRol(["Administrador"]), async(req, res) => {
    try {
        const { rutaId, autobusId } = req.body;

        const ruta = await RutaSchema.findById(rutaId);
        if (!ruta) {
            return res.status(404).json({ message: "Ruta no encontrada" });
        }

        const autoBus = await Autobus.findById(autobusId);
        if (!autoBus) {
            return res.status(404).json({ message: "Autobus inexistente" });
        }

        if (autoBus.idRuta && autoBus.idRuta.toString() === rutaId) {
            return res.status(400).json({ message: "Este autobús ya está asignado a esta ruta" });
        }

        autoBus.idRuta = rutaId;
        await autoBus.save();

        res.status(200).json({
            message: "Autobús asignado a la ruta correctamente",
            ruta,
            autoBus,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error en el servidor", error: err });
    }
});


/**
 * @swagger
 * /autobus/all:
 *   get:
 *     summary: Obtener todos los autobuses
 *     description: Retorna una lista de todos los autobuses registrados en el sistema.
 *     tags: [Autobus]
 *     responses:
 *       200:
 *         description: Lista de autobuses obtenida con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: ID único del autobús
 *                     example: "60c72b2f9c2c1d5d5f83a8a5"
 *                   placa:
 *                     type: string
 *                     example: "ABC123"
 *                   modelo:
 *                     type: string
 *                     example: "Volvo B8R"
 *                   capacidad:
 *                     type: string
 *                     example: "40"
 *                   estado:
 *                     type: string
 *                     enum: [Activo, Inactivo]
 *                     example: "Activo"
 *                   ubicacionActual:
 *                     type: string
 *                     example: "Terminal 1"
 *                   idRuta:
 *                     type: string
 *                     nullable: true
 *                     example: "60c72b2f9c2c1d5d5f83a8a5"
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al obtener los autobuses"
 *                 error:
 *                   type: string
 *                   example: "Detalles del error"
 */

router.get("/all", verificarToken, verificarRol(["Administrador"]), async (req, res) => {
    try {
        const autobuses = await Autobus.find();
        res.json(autobuses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /autobus/{id}:
 *   get:
 *     summary: Obtener un autobús por ID
 *     description: Retorna los datos de un autobús en base a su ID.
 *     tags: [Autobus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del autobús
 *     responses:
 *       200:
 *         description: Autobús obtenido con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "607c72ef1532071b7c8c8a13"
 *                 placa:
 *                   type: string
 *                   example: "ABC123"
 *                 modelo:
 *                   type: string
 *                   example: "Volvo B8R"
 *                 capacidad:
 *                   type: string
 *                   example: "40"
 *                 estado:
 *                   type: string
 *                   example: "Activo"
 *                 ubicacionActual:
 *                   type: string
 *                   example: "Terminal 1"
 *                 idRuta:
 *                   type: string
 *                   example: "60c72b2f9c2c1d5d5f83a8a5"
 *       404:
 *         description: Autobús no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Autobús no encontrado"
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al obtener el autobús"
 */

router.get("/:id", verificarToken, verificarRol(["Administrador"]), async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID del autobús es requerido" });
    try {
        const autobus = await Autobus.findById(id);
        if (!autobus) return res.status(404).json({ error: "Autobús no encontrado" });
        res.json(autobus);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /autobus/update/{id}:
 *   put:
 *     summary: Actualizar información de un autobús
 *     description: Permite actualizar los datos de un autobús. Solo se modificarán los campos proporcionados.
 *     tags: [Autobus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del autobús a actualizar
 *       - in: body
 *         name: datos
 *         description: Campos a actualizar del autobús
 *         schema:
 *           type: object
 *           properties:
 *             placa:
 *               type: string
 *               example: "DEF456"
 *             modelo:
 *               type: string
 *               example: "Mercedes-Benz Tourismo"
 *             capacidad:
 *               type: string
 *               example: "50"
 *             estado:
 *               type: string
 *               example: "En mantenimiento"
 *             ubicacionActual:
 *               type: string
 *               example: "Terminal 2"
 *             idRuta:
 *               type: string
 *               example: "60c72b2f9c2c1d5d5f83a8a5"
 *     responses:
 *       200:
 *         description: Autobús actualizado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Autobús actualizado con éxito"
 *                 updatedAutobus:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "607c72ef1532071b7c8c8a13"
 *                     placa:
 *                       type: string
 *                       example: "DEF456"
 *                     modelo:
 *                       type: string
 *                       example: "Mercedes-Benz Tourismo"
 *                     capacidad:
 *                       type: string
 *                       example: "50"
 *                     estado:
 *                       type: string
 *                       example: "En mantenimiento"
 *                     ubicacionActual:
 *                       type: string
 *                       example: "Terminal 2"
 *                     idRuta:
 *                       type: string
 *                       example: "60c72b2f9c2c1d5d5f83a8a5"
 *       400:
 *         description: No se proporcionaron valores para actualizar o error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No se proporcionaron valores para actualizar"
 *       404:
 *         description: Autobús no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Autobús no encontrado"
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error en el servidor"
 *                 error:
 *                   type: string
 *                   example: "Detalles del error"
 */

router.put("/update/:id", verificarToken, verificarRol(["Administrador"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { placa, modelo, capacidad, estado, ubicacionActual, idRuta } = req.body;

        // Buscar el autobús por ID
        const autobus = await Autobus.findById(id);
        if (!autobus) {
            return res.status(404).json({ message: "Autobús no encontrado" });
        }

        // Crear objeto con solo los valores definidos
        const fieldsToUpdate = { placa, modelo, capacidad, estado, ubicacionActual, idRuta };
        const newValues = {};

        Object.entries(fieldsToUpdate).forEach(([key, value]) => {
            if (value !== undefined) {
                newValues[key] = value;
            }
        });

        if (Object.keys(newValues).length === 0) {
            return res.status(400).json({ message: "No se proporcionaron valores para actualizar" });
        }

        // Actualizar el autobús
        const updatedAutobus = await Autobus.findByIdAndUpdate(id, newValues, { new: true });

        res.status(200).json({
            message: "Autobús actualizado con éxito",
            updatedAutobus,
        });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error });
    }
});


/**
 * @swagger
 * /autobus/delete/{id}:
 *   delete:
 *     summary: "Eliminar un autobús"
 *     description: "Elimina un autobús de la base de datos usando su ID."
 *     tags:
 *       - Autobus
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: "ID del autobús que se desea eliminar"
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Autobús eliminado correctamente"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Autobús eliminado correctamente"
 *       400:
 *         description: "Solicitud incorrecta: Falta el ID del autobús"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "ID del autobús es requerido"
 *       404:
 *         description: "Autobús no encontrado"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Autobús no encontrado"
 *       500:
 *         description: "Error interno del servidor"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error en el servidor"
 */


router.delete("/delete/:id", verificarToken, verificarRol(["Administrador"]), async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID del autobús es requerido" });
    try {
        const autobus = await Autobus.findByIdAndDelete(id);
        if (!autobus) return res.status(404).json({ error: "Autobús no encontrado" });
        res.json({ message: "Autobús eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /estado/{id}:
 *   patch:
 * 
 *     summary: Cambiar el estado del autobús
 *     description: Actualiza el estado de un autobús en la base de datos.
 *     tags: [Autobus]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID del autobús
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Estado del autobús a actualizar.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 description: Nuevo estado del autobús.
 *                 example: "en servicio"
 *     responses:
 *       200:
 *         description: Autobús actualizado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 estado:
 *                   type: string
 *                 fechaActualizacion:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Parámetros inválidos o error en la actualización.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Autobús no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */


router.patch("/estado/:id", verificarToken, verificarRol(["Administrador"]), async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    if (!id || !estado) return res.status(400).json({ error: "ID y estado son requeridos" });
    try {
        const autobus = await Autobus.findByIdAndUpdate(id, { estado }, { new: true });
        if (!autobus) return res.status(404).json({ error: "Autobús no encontrado" });
        res.json(autobus);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @swagger
 * /ubicacion/{id}:
 *   patch:
 *     summary: Actualiza la ubicación en tiempo real de un autobús
 *     description: Actualiza la ubicación actual de un autobús dado su ID.
 *     tags: [Autobus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del autobús cuya ubicación se desea actualizar.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ubicacionActual:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                     description: Latitud de la ubicación.
 *                   lon:
 *                     type: number
 *                     description: Longitud de la ubicación.
 *             required:
 *               - ubicacionActual
 *     responses:
 *       200:
 *         description: Autobús con ubicación actualizada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID del autobús.
 *                 ubicacionActual:
 *                   type: object
 *                   properties:
 *                     lat:
 *                       type: number
 *                       description: Latitud de la ubicación.
 *                     lon:
 *                       type: number
 *                       description: Longitud de la ubicación.
 *       400:
 *         description: Error en la solicitud (ID o ubicación faltante).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Detalle del error.
 *       404:
 *         description: Autobús no encontrado con el ID proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error indicando que el autobús no fue encontrado.
 */

router.patch("/ubicacion/:id", verificarToken, verificarRol(["Administrador"]), async (req, res) => {
    const { id } = req.params;
    const { ubicacionActual } = req.body;
    if (!id || !ubicacionActual) return res.status(400).json({ error: "ID y ubicación son requeridos" });
    try {
        const autobus = await Autobus.findByIdAndUpdate(id, { ubicacionActual }, { new: true });
        if (!autobus) return res.status(404).json({ error: "Autobús no encontrado" });
        res.json(autobus);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
