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
 *     description: Crea una nueva ruta con el nombre, las coordenadas de la ruta, las paradas y la tarifa proporcionadas.
 *     tags:
 *       - "Ruta"
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
 *               coordenadas:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     example: "LineString"
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: array
 *                       items:
 *                         type: number
 *                       example: [[-74.0060, 40.7128], [-74.0065, 40.7135]]
 *                 description: Coordenadas de la ruta, representada como un "LineString"
 *               paradas:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: string
 *                       example: "Parada 1"
 *                     ubicacion:
 *                       type: object
 *                       properties:
 *                         type:
 *                           type: string
 *                           example: "Point"
 *                         coordinates:
 *                           type: array
 *                           items:
 *                             type: numb
*/



router.post('/add', async (req, res) => {
    try {
        const { nombreRuta, coordenadas, paradas, Tarifa } = req.body;
        console.log(nombreRuta, coordenadas, paradas, Tarifa);

        // Validación de parámetros requeridos
        if (!nombreRuta || !coordenadas || !paradas || Tarifa === undefined) {
            return res.status(400).json({ 
                message: `Faltan parámetros requeridos: nombreRuta, coordenadas, paradas o tarifa: ${nombreRuta} ${JSON.stringify(coordenadas)} ${JSON.stringify(paradas)} ${Tarifa}`,
            });
        }        

        const ruta = new RutaSchema({
            nombreRuta,
            coordenadas,
            paradas,
            Tarifa: Tarifa,
            fechaCreacion: Date.now(),
        });

        await ruta.save();

        res.status(201).json({ message: "Ruta agregada con éxito", ruta });

    } catch (err) {
        res.status(500).json({ message: "Hubo un error en el servidor", err });
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
 *                   coordenadas:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "LineString"
 *                       coordinates:
 *                         type: array
 *                         items:
 *                           type: array
 *                           items:
 *                             type: number
 *                           example: [[-74.0060, 40.7128], [-74.0065, 40.7135]]
 *                     description: Coordenadas de la ruta, representada como un "LineString"
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
 *                         ubicacion:
 *                           type: object
 *                           properties:
 *                             type:
 *                               type: string
 *                               example: "Point"
 *                             coordinates:
 *                               type: array
 *                               items:
 *                                 type: number
 *                               example: [-74.0060, 40.7128]
 *                     description: Lista de paradas en la ruta con sus ubicaciones (coordenadas)
 *                     example:
 *                       - _id: "67b58676a4da6e4181c9dbfc"
 *                         nombre: "Parada 1"
 *                         ubicacion: 
 *                           type: "Point"
 *                           coordinates: [-74.0060, 40.7128]
 *                       - _id: "67b58676a4da6e4181c9dbfd"
 *                         nombre: "Parada 2"
 *                         ubicacion: 
 *                           type: "Point"
 *                           coordinates: [-74.0065, 40.7135]
 *                   Tarifa:
 *                     type: number
 *                     description: Tarifa de la ruta
 *                     example: 20
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
router.get("/all", async(req, res) => {
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
 *                     coordenadas:
 *                       type: object
 *                       properties:
 *                         type:
 *                           type: string
 *                           example: "LineString"
 *                         coordinates:
 *                           type: array
 *                           items:
 *                             type: array
 *                             items:
 *                               type: number
 *                             example: [[-74.0060, 40.7128], [-74.0065, 40.7135]]
 *                       description: Coordenadas de la ruta, representada como un "LineString"
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
 *                           ubicacion:
 *                             type: object
 *                             properties:
 *                               type:
 *                                 type: string
 *                                 example: "Point"
 *                               coordinates:
 *                                 type: array
 *                                 items:
 *                                   type: number
 *                                 example: [-74.0060, 40.7128]
 *                       description: Lista de paradas en la ruta con sus ubicaciones (coordenadas)
 *                       example:
 *                         - _id: "67b58676a4da6e4181c9dbfc"
 *                           nombre: "Parada 1"
 *                           ubicacion: 
 *                             type: "Point"
 *                             coordinates: [-74.0060, 40.7128]
 *                         - _id: "67b58676a4da6e4181c9dbfd"
 *                           nombre: "Parada 2"
 *                           ubicacion: 
 *                             type: "Point"
 *                             coordinates: [-74.0065, 40.7135]
 *                     Tarifa:
 *                       type: number
 *                       description: Tarifa de la ruta
 *                       example: 20
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
router.get("/get/:id", async(req, res) => {
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
 *                     ubicacion:
 *                       type: object
 *                       properties:
 *                         type:
 *                           type: string
 *                           example: "Point"
 *                         coordinates:
 *                           type: array
 *                           items:
 *                             type: number
 *                             example: [-74.0060, 40.7128]  # Coordenadas de la parada
 *               coordenadas:
 *                 type: array
 *                 items:
 *                   type: array
 *                   items:
 *                     type: number
 *                   example: [[-74.0060, 40.7128], [-74.0065, 40.7135]]  # Coordenadas de la ruta
 *               Tarifa:
 *                 type: number
 *                 example: 25  # Nueva tarifa
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
 *                     coordenadas:
 *                       type: object
 *                       properties:
 *                         type:
 *                           type: string
 *                           example: "LineString"
 *                         coordinates:
 *                           type: array
 *                           items:
 *                             type: array
 *                             items:
 *                               type: number
 *                             example: [[-74.0060, 40.7128], [-74.0065, 40.7135]]
 *                       description: Coordenadas de la ruta, representada como un "LineString"
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
 *                           ubicacion:
 *                             type: object
 *                             properties:
 *                               type:
 *                                 type: string
 *                                 example: "Point"
 *                               coordinates:
 *                                 type: array
 *                                 items:
 *                                   type: number
 *                                 example: [-74.0060, 40.7128]
 *                       description: Lista de paradas en la ruta con sus ubicaciones (coordenadas)
 *                       example:
 *                         - _id: "67b58676a4da6e4181c9dbfc"
 *                           nombre: "Parada 1"
 *                           ubicacion: 
 *                             type: "Point"
 *                             coordinates: [-74.0060, 40.7128]
 *                         - _id: "67b58676a4da6e4181c9dbfd"
 *                           nombre: "Parada 2"
 *                           ubicacion: 
 *                             type: "Point"
 *                             coordinates: [-74.0065, 40.7135]
 *                     Tarifa:
 *                       type: number
 *                       description: Tarifa de la ruta
 *                       example: 25
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
router.put("/update/:id", async (req, res) => {
    try {
        const routeId = req.params.id;
        const { nombreRuta, paradas, coordenadas, Tarifa } = req.body;

        const selectedRoute = await RutaSchema.findById(routeId);
        if (!selectedRoute) {
            return res.status(404).json({ message: "Ruta no encontrada" });
        }

        const fieldsToUpdate = { nombreRuta, paradas, coordenadas, Tarifa };
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
router.delete("/delete/:id", async(req, res) => {
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


module.exports = router;