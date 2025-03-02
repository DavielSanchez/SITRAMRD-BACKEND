const express = require("express");
const router = express.Router();
const RutaSchema = require("../models/Ruta");
const AutoBus = require("../models/Autobus");
const verificarRol = require("../middleware/verificarRol");


/**
 * @swagger
 * /ruta/add:
 *   post:
 *     summary: Crear una nueva ruta
 *     description: Crea una ruta con las paradas y coordenadas proporcionadas.
 *     tags: [Ruta]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombreRuta:
 *                 type: string
 *                 example: "Ruta 1"
 *               paradas:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: string
 *                       example: "Parada 1"
 *                     coordenadas:
 *                       type: array
 *                       items:
 *                         type: number
 *                       example: [19.432608, -99.133209]  # Coordenadas de latitud y longitud
 *                 example:
 *                   - nombre: "Parada 1"
 *                     coordenadas: [19.432608, -99.133209]
 *                   - nombre: "Parada 2"
 *                     coordenadas: [19.434123, -99.134567]
 *                   - nombre: "Parada 3"
 *                     coordenadas: [19.435678, -99.135678]
 *             required:
 *               - nombreRuta
 *               - paradas
 *     responses:
 *       201:
 *         description: Ruta agregada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ruta agregada con éxito"
 *                 ruta:
 *                   type: object
 *                   properties:
 *                     nombreRuta:
 *                       type: string
 *                       example: "Ruta 1"
 *                     paradas:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           nombre:
 *                             type: string
 *                             example: "Parada 1"
 *                           coordenadas:
 *                             type: array
 *                             items:
 *                               type: number
 *                             example: [19.432608, -99.133209]
 *                       example:
 *                         - nombre: "Parada 1"
 *                           coordenadas: [19.432608, -99.133209]
 *                         - nombre: "Parada 2"
 *                           coordenadas: [19.434123, -99.134567]
 *                         - nombre: "Parada 3"
 *                           coordenadas: [19.435678, -99.135678]
 *                     fechaCreacion:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-02-19T14:23:47.000Z"
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Faltan campos requeridos o datos inválidos"
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al agregar la ruta"
 *                 error:
 *                   type: string
 *                   example: "Error al guardar en la base de datos"
 */



router.post("/add", verificarRol(["Administrador"]), async(req, res) => {
    const { nombreRuta, paradas, coordenadas } = req.body;
    const ruta = new RutaSchema({
        nombreRuta,
        paradas,
        coordenadas,
        fechaCreacion: Date.now(),
    });

    try {
        await ruta.save();
        res.status(201).json({ message: "Ruta agregada con éxito", ruta });
    } catch (error) {
        res.status(500).json({ message: "Error al agregar la ruta", error });
    }
});


/**
 * @swagger
 * /ruta/all:
 *   get:
 *     summary: Obtener todas las rutas
 *     description: Devuelve una lista de todas las rutas registradas en el sistema, con detalles como nombre de la ruta, paradas, coordenadas y fecha de creación.
 *     tags: [Ruta]
 *     responses:
 *       200:
 *         description: Lista de rutas encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: ID único de la ruta
 *                     example: "67b58676a4da6e4181c9dbfb"
 *                   nombreRuta:
 *                     type: string
 *                     description: Nombre de la ruta
 *                     example: "Ruta 2"
 *                   paradas:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           description: ID único de la parada
 *                           example: "67b58676a4da6e4181c9dbfc"
 *                         nombre:
 *                           type: string
 *                           description: Nombre de la parada
 *                           example: "Parada 1"
 *                         coordenadas:
 *                           type: array
 *                           items:
 *                             type: number
 *                           description: Coordenadas de la parada (latitud y longitud)
 *                           example: [19.432608, -99.133209]
 *                     description: Lista de paradas en la ruta con sus coordenadas
 *                     example:
 *                       - _id: "67b58676a4da6e4181c9dbfc"
 *                         nombre: "Parada 1"
 *                         coordenadas: [19.432608, -99.133209]
 *                       - _id: "67b58676a4da6e4181c9dbfd"
 *                         nombre: "Parada 2"
 *                         coordenadas: [19.434123, -99.134567]
 *                       - _id: "67b58676a4da6e4181c9dbfe"
 *                         nombre: "Parada 3"
 *                         coordenadas: [19.435678, -99.13589]
 *                   fechaCreacion:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha y hora en que se creó la ruta
 *                     example: "2025-02-19T07:21:26.922Z"
 *       404:
 *         description: No hay rutas disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No hay rutas disponibles."
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
 *                   example: "Error al acceder a la base de datos"
 */


router.get("/all", verificarRol(["Administrador"]), async(req, res) => {
    try {
        const everyRoute = await RutaSchema.find();
        if (everyRoute.length === 0) {
            return res.status(404).json({ message: "No hay rutas disponibles." });
        }
        res.status(200).json(everyRoute);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Hubo un error en el servidor", error });
    }
});



/**
 * @swagger
 * /ruta/get/{id}:
 *   get:
 *     summary: Obtener una ruta por su ID
 *     description: Devuelve la información de una ruta específica por su ID.
 *     tags: [Ruta]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la ruta
 *         schema:
 *           type: string
 *           example: "67b58676a4da6e4181c9dbfb"
 *     responses:
 *       200:
 *         description: Ruta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ruta encontrada"
 *                 route:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: ID único de la ruta
 *                       example: "67b58676a4da6e4181c9dbfb"
 *                     nombreRuta:
 *                       type: string
 *                       description: Nombre de la ruta
 *                       example: "Ruta 2"
 *                     paradas:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: ID único de la parada
 *                             example: "67b58676a4da6e4181c9dbfc"
 *                           nombre:
 *                             type: string
 *                             description: Nombre de la parada
 *                             example: "Parada 1"
 *                           coordenadas:
 *                             type: array
 *                             items:
 *                               type: number
 *                             description: Coordenadas de la parada (latitud y longitud)
 *                             example: [19.432608, -99.133209]
 *                     fechaCreacion:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha y hora en que se creó la ruta
 *                       example: "2025-02-19T07:21:26.922Z"
 *       404:
 *         description: Ruta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "La Id proporcionada es inexistente"
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
 *                   example: "Error al acceder a la base de datos"
 */



router.get("/get/:id", verificarRol(["Administrador"]), async(req, res) => {
    try {
        const id = req.params.id;
        const RouteId = await RutaSchema.findById(id);

        if (!RouteId) {
            return res.status(404).json({ message: "La Id proporcionada es inexistente" });
        }
        res.status(200).json({ message: "Ruta encontrada", route: RouteId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
});

/**
 * @swagger
 * /ruta/update/{id}:
 *   put:
 *     summary: Actualizar una ruta existente
 *     description: Permite actualizar el nombre, las paradas y las coordenadas de una ruta existente
 *     tags: [Ruta]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la ruta a actualizar
 *         schema:
 *           type: string
 *           example: "67b58676a4da6e4181c9dbfb"  # Ejemplo de ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombreRuta:
 *                 type: string
 *                 example: "Ruta 2"
 *               paradas:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: string
 *                       example: "Parada 1"
 *                     coordenadas:
 *                       type: array
 *                       items:
 *                         type: number
 *                         example: [19.432608, -99.133209]  # Coordenadas de la parada
 *               coordenadas:
 *                 type: array
 *                 items:
 *                   type: array
 *                   items:
 *                     type: number
 *                   example: [[19.432608, -99.133209], [19.434123, -99.134567]]  # Coordenadas de la ruta
 *     responses:
 *       200:
 *         description: Ruta actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ruta actualizada con éxito"
 *                 updatedRoute:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: ID único de la ruta
 *                       example: "67b58676a4da6e4181c9dbfb"
 *                     nombreRuta:
 *                       type: string
 *                       description: Nombre de la ruta
 *                       example: "Ruta 2"
 *                     paradas:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: ID único de la parada
 *                             example: "67b58676a4da6e4181c9dbfc"
 *                           nombre:
 *                             type: string
 *                             description: Nombre de la parada
 *                             example: "Parada 1"
 *                           coordenadas:
 *                             type: array
 *                             items:
 *                               type: number
 *                             description: Coordenadas de la parada
 *                             example: [19.432608, -99.133209]
 *                     fechaCreacion:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha de creación de la ruta
 *                       example: "2025-02-19T07:21:26.922Z"
 *       400:
 *         description: No se proporcionaron datos válidos para la actualización
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No se proporcionaron valores para actualizar"
 *       404:
 *         description: Ruta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ruta no encontrada"
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
 *                   example: "Error al actualizar en la base de datos"
 */



router.put("/update/:id", verificarRol(["Administrador"]), async(req, res) => {
    try {
        const routeId = req.params.id;
        const { nombreRuta, paradas, coordenadas } = req.body;

        const selectedRoute = await RutaSchema.findById(routeId);
        if (!selectedRoute) {
            return res.status(404).json({ message: "Ruta no encontrada" });
        }

        const fieldsToUpdate = { nombreRuta, paradas, coordenadas };
        const newValues = {};

        Object.entries(fieldsToUpdate).forEach(([key, value]) => {
            if (value !== undefined) {
                newValues[key] = value;
            }
        });

        if (Object.keys(newValues).length === 0) {
            return res.status(400).json({ message: "No se proporcionaron valores para actualizar" });
        }

        const updatedRoute = await RutaSchema.findByIdAndUpdate(routeId, newValues, { new: true });
        res.status(200).json({
            message: "Ruta actualizada con éxito",
            updatedRoute,
        });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error });
    }
});

/**
 * @swagger
 * /ruta/delete/{id}:
 *   delete:
 *     summary: Eliminar una ruta por su ID
 *     description: Permite eliminar una ruta específica por su ID
 *     tags: [Ruta]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la ruta a eliminar
 *         schema:
 *           type: string
 *           example: "67b58676a4da6e4181c9dbfb"  # Ejemplo de ID
 *     responses:
 *       200:
 *         description: Ruta eliminada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ruta eliminada con éxito"
 *                 deletedRoute:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: ID único de la ruta eliminada
 *                       example: "67b58676a4da6e4181c9dbfb"
 *                     nombreRuta:
 *                       type: string
 *                       description: Nombre de la ruta eliminada
 *                       example: "Ruta 1"
 *                     paradas:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: ID único de la parada
 *                             example: "67b58676a4da6e4181c9dbfc"
 *                           nombre:
 *                             type: string
 *                             description: Nombre de la parada
 *                             example: "Parada 1"
 *                           coordenadas:
 *                             type: array
 *                             items:
 *                               type: number
 *                             description: Coordenadas de la parada
 *                             example: [19.432608, -99.133209]
 *                     fechaCreacion:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha de creación de la ruta
 *                       example: "2025-02-19T07:21:26.922Z"
 *       404:
 *         description: Ruta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ruta con ID 67b58676a4da6e4181c9dbfb no encontrada"
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
 *                   example: "Error al eliminar la ruta de la base de datos"
 */

router.delete("/delete/:id", verificarRol(["Administrador"]), async(req, res) => {
    try {
        const id = req.params.id;

        const deletedRoute = await RutaSchema.findByIdAndDelete(id);

        if (!deletedRoute) {
            return res.status(404).json({ message: `Ruta con ID ${id} no encontrada` });
        }

        res.status(200).json({ message: "Ruta eliminada con éxito", deletedRoute });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error });
    }
});


//Funcionalidades Operador

/**
 * @swagger
 * /ruta/asignar:
 *   post:
 *     summary: Asignar un autobús a una ruta
 *     description: Asigna un autobús a una ruta específica. Verifica que la ruta y el autobús existen, y que el autobús no esté ya asignado a otra ruta.
 *     tags: [Autobús]
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


router.post("/asignar", verificarRol(["Operador", "Administrador"]), async(req, res) => {
    try {
        const { rutaId, autobusId } = req.body;

        const ruta = await RutaSchema.findById(rutaId);
        if (!ruta) {
            return res.status(404).json({ message: "Ruta no encontrada" });
        }

        const autoBus = await AutoBus.findById(autobusId);
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
 * /ruta/autobus/add:
 *   post:
 *     summary: Agregar un nuevo autobús
 *     description: Agrega un autobús con la información proporcionada.
 *     tags: [Autobús]
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
router.post("/autoBus/add", verificarRol(["Operador", "Administrador"]), async(req, res) => {
    try {
        const { placa, modelo, capacidad, estado, ubicacionActual, idRuta } = req.body;

        if (!placa || !modelo || !capacidad || !estado) {
            return res.status(400).json({ message: "Faltan campos requeridos" });
        }

        const nuevoAutobus = new AutoBus({
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



module.exports = router;