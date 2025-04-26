const express = require("express");
const router = express.Router();
const Autobus = require("../models/Autobus");
const RutaSchema = require("../models/Ruta");
const UserSchema = require("../models/Usuario")
const verificarRol = require("../middleware/verificarRol");
const verificarToken = require("../middleware/verificarToken")




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
router.get("/all", async(req, res) => {
    try {
        const autobuses = await Autobus.find();
        res.json(autobuses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// router.get("/choferes/all", async(req, res) => {
//     try {
//         const autobuses = await UserSchema.find({
//             userRol: "Conductor"
//         }).populate("autobusAsignado", {
//             _id: 1,
//             placa: 1,
//             modelo: 1,
//             capacidad: 1,
//             estado: 1,
//             ubicacionActual: 1
//         });
//         res.json(autobuses);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

router.get("/choferes/all", async(req, res) => {
    try {
        const choferes = await UserSchema.find({ userRol: "Conductor" });

        const resultados = await Promise.all(choferes.map(async(chofer) => {
            const autobus = await Autobus.findOne({ conductorAsignado: chofer._id }).select("placa modelo capacidad estado ubicacionActual");
            return {
                ...chofer.toObject(),
                autobusAsignado: autobus || null
            };
        }));

        res.json(resultados);
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
router.get("/:id", async(req, res) => {
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
 * /autobus/location/{id}:
 *   get:
 *     summary: Obtener ubicación en tiempo real de un vehículo
 *     description: Retorna la ubicación actual de un autobús según su ID.
 *     tags: [Autobus]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID del vehículo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ubicación del vehículo obtenida con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 ubicacionActual:
 *                   type: object
 *                   properties:
 *                     lat:
 *                       type: number
 *                     lon:
 *                       type: number
 *       404:
 *         description: Vehículo no encontrado.
 *       500:
 *         description: Error en el servidor.
 */
router.get("/location/:id", async(req, res) => {
    try {
        const { id } = req.params;
        const vehiculo = await Autobus.findById(id);

        if (!vehiculo) return res.status(404).json({ message: "Vehículo no encontrado" });

        res.json({
            id: vehiculo._id,
            ubicacionActual: vehiculo.ubicacionActual || { lat: null, lon: null }
        });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la ubicación" });
    }
});

router.get("/count/:userId", async(req, res) => {
    try {
        const userId = req.params.userId;
        const usuario = await UserSchema.findById(userId).populate('rutasAsignadas');

        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const rutasIds = usuario.rutasAsignadas.map(r => r._id);

        const cantidadAutobuses = await Autobus.countDocuments({ rutaAsignada: { $in: rutasIds } });
        const buses = await Autobus.find({ rutaAsignada: { $in: rutasIds } });

        res.status(200).json({
            message: "Cantidad de autobuses encontrada",
            cantidadAutobuses: cantidadAutobuses,
            autobuses: buses
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error en el servidor",
            error: error.message
        });
    }
});

router.get("/por-ruta/:rutaId", async(req, res) => {
    const { rutaId } = req.params;
    if (!rutaId) return res.status(400).json({ error: "ID de la ruta es requerido" });

    try {
        const autobuses = await Autobus.find({ "rutaAsignada": rutaId });

        if (autobuses.length === 0) {
            return res.status(404).json({ error: "No se encontraron autobuses para esta ruta" });
        }

        res.json(autobuses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


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
router.post("/add", async(req, res) => {
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

router.post("/chofer/asignar", async(req, res) => {
    try {
        const { idChofer, autobusId } = req.body;
        console.log(idChofer, ' ', autobusId)

        const chofer = await UserSchema.findById(idChofer)
        const bus = await Autobus.findById(autobusId)
        if (!chofer) {
            return res.status(404).json({ message: "Chofer inexistente" });
        } else if (chofer && bus.conductorAsignado !== chofer._id) {
            bus.conductorAsignado = chofer._id;
            await bus.save();
        }

    } catch (error) {
        console.error("Error al asignar el chofer:", error);
        res.status(500).json({ message: "Error al asignar el chofer", error: error.message });
    }
})

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
router.post("/asignar", async(req, res) => {
    try {
        const { rutaId, autobusId } = req.body;
        console.log(rutaId, ' ', autobusId)

        const ruta = await RutaSchema.findById(rutaId);
        if (!ruta) {
            return res.status(404).json({ message: "Ruta no encontrada" });
        }

        const autoBus = await Autobus.findById(autobusId)
        if (!autoBus) {
            return res.status(404).json({ message: "Autobus inexistente" });
        } else if (autoBus) {
            console.log('autobus encontrado')
        }

        if (autoBus.rutaAsignada && autoBus.rutaAsignada.toString() === rutaId) {
            return res.status(400).json({ message: "Este autobús ya está asignado a esta ruta" });
        }

        autoBus.rutaAsignada = rutaId;
        await autoBus.save();

        res.status(200).json({
            message: "Autobús asignado a la ruta correctamente",
            ruta: rutaId,
            autoBus: autobusId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error en el servidor", error: err });
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
router.put("/update/:id", async(req, res) => {
    try {
        const { id } = req.params;
        const { placa, modelo, capacidad, estado, idRuta } = req.body;

        // Buscar el autobús por ID
        const autobus = await Autobus.findById(id);
        if (!autobus) {
            return res.status(404).json({ message: "Autobús no encontrado" });
        }

        // Crear objeto con solo los valores definidos
        const fieldsToUpdate = { placa, modelo, capacidad, estado, idRuta };
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
 * /autobus/estado/{id}:
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
router.patch("/estado/:id", async(req, res) => {
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
 * /autobus/delete/{id}:
 *   delete:
 *     summary: Eliminar un vehículo
 *     description: Permite eliminar un autobús de la base de datos si no está asignado a una ruta.
 *     tags: [Autobus]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID del vehículo a eliminar
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vehículo eliminado exitosamente.
 *       400:
 *         description: No se puede eliminar un vehículo asignado a una ruta.
 *       404:
 *         description: Vehículo no encontrado.
 *       500:
 *         description: Error en el servidor.
 */
router.delete("/delete/:id", async(req, res) => {
    try {
        const { id } = req.params;
        const vehiculo = await Autobus.findById(id);

        if (!vehiculo) return res.status(404).json({ message: "Vehículo no encontrado" });
        if (vehiculo.idRuta) return res.status(400).json({ message: "No se puede eliminar un vehículo asignado a una ruta" });

        await Autobus.findByIdAndDelete(id);
        res.json({ message: "Vehículo eliminado" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el vehículo" });
    }
});

module.exports = router;