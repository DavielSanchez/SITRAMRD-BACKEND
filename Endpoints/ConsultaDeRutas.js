const express = require("express");
const router = express.Router();
const RutaSchema = require("../models/Ruta");
const AutoBus = require("../models/Autobus");
const verificarRol = require("../middleware/verificarRol");
const MetroRuta = require("../models/Metro");

/**
 * @swagger
 * /ruta/buscar:
 *   get:
 *     summary: Buscar una ruta por nombre
 *     description: Este endpoint permite buscar una ruta en el sistema utilizando su nombre. Devuelve los detalles de la ruta, incluidas las paradas, coordenadas y tarifa.
 *     tags: [Ruta]
 *     parameters:
 *       - in: query
 *         name: nombre
 *         description: Nombre de la ruta a buscar
 *         required: true
 *         schema:
 *           type: string
 *           example: "Ruta 1"
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
 *                   example: "Resultado encontrado"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: ID único de la ruta
 *                       example: "67b58676a4da6e4181c9dbfb"
 *                     nombreRuta:
 *                       type: string
 *                       description: Nombre de la ruta
 *                       example: "Ruta 1"
 *                     coordenadas:
 *                       type: object
 *                       properties:
 *                         type:
 *                           type: string
 *                           example: "LineString"
 *                         coordinates:
 *                           type: array
 *                           items:
 *                             type: number
 *                             example: [-74.0060, 40.7128]
 *                     paradas:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
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
 *                                   example: [-74.0060, 40.7128]
 *                     tarifa:
 *                       type: number
 *                       description: Tarifa asociada a la ruta
 *                       example: 25
 *                     fechaCreacion:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha de creación de la ruta
 *                       example: "2025-03-01T12:30:45Z"
 *       400:
 *         description: Parámetros inválidos (nombre no proporcionado)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No proporcionaste un nombre válido"
 *       404:
 *         description: Ruta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No se encontró ningún resultado con la ruta: Ruta 1"
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
 */



router.get('/buscar', async (req, res) => {
    try {
        const { nombre } = req.query; 
        
        if (!nombre) {
            return res.status(400).json({ message: "No proporcionaste un nombre válido" });
        }

        const resultado = await RutaSchema.findOne({ nombreRuta: nombre });

        if (!resultado) {
            return res.status(404).json({ message: `No se encontró ningún resultado con la ruta: ${nombre}`});
        }

        return res.status(200).json({ message: "Resultado encontrado", data: resultado });
    } catch (error) {
        return res.status(500).json({ message: "Hubo un error en el servidor", error });
    }
});

/**
 * @swagger
 * /ruta/paradas/{id}:
 *   get:
 *     summary: Obtener las paradas de una ruta por ID
 *     description: Este endpoint devuelve las paradas de una ruta, dado su ID. Incluye el nombre de la parada y las coordenadas.
 *     tags: [Ruta]
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID único de la ruta
 *         required: true
 *         schema:
 *           type: string
 *           example: "67b58676a4da6e4181c9dbfb"
 *     responses:
 *       200:
 *         description: Paradas de la ruta encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: ID único de la parada
 *                         example: "67b58676a4da6e4181c9dbfc"
 *                       nombre:
 *                         type: string
 *                         description: Nombre de la parada
 *                         example: "Parada 1"
 *                       ubicacion:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: "Point"
 *                           coordinates:
 *                             type: array
 *                             items:
 *                               type: number
 *                               example: [-74.0060, 40.7128]
 *       400:
 *         description: ID no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No proporcionaste un id válido"
 *       404:
 *         description: Ruta no encontrada por ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No se encontró ningún resultado con el id: 67b58676a4da6e4181c9dbfb"
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
 */

router.get('/paradas/:id', async (req,res) =>{

    try{
        const {id} = req.params;
        if (!id) {
            return res.status(400).json({ message: "No proporcionaste un id válido" });
        }
        const resultado = await RutaSchema.findById(id);
        if (!resultado) {
            return res.status(404).json({ message: `No se encontró ningún resultado con el id: ${id}`});
        }
        const paradas = resultado.paradas;
        return res.status(200).json({data: paradas });
    } catch (error){
        return res.status(500).json({ message: "Hubo un error en el servidor", error });
    }

})

/**
 * @swagger
 * /ruta/cercanas:
 *   get:
 *     summary: Buscar rutas cercanas a una ubicación
 *     description: Este endpoint devuelve una lista de rutas cercanas a la ubicación proporcionada mediante latitud y longitud.
 *     tags: [Ruta]
 *     parameters:
 *       - in: query
 *         name: lat
 *         description: Latitud de la ubicación a consultar
 *         required: true
 *         schema:
 *           type: number
 *           example: 40.7128
 *       - in: query
 *         name: lng
 *         description: Longitud de la ubicación a consultar
 *         required: true
 *         schema:
 *           type: number
 *           example: -74.0060
 *     responses:
 *       200:
 *         description: Rutas cercanas encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       nombreRuta:
 *                         type: string
 *                         description: Nombre de la ruta
 *                         example: "Ruta 1"
 *                       paradas:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             nombre:
 *                               type: string
 *                               description: Nombre de la parada
 *                               example: "Parada 1"
 *                             ubicacion:
 *                               type: object
 *                               properties:
 *                                 type:
 *                                   type: string
 *                                   example: "Point"
 *                                 coordinates:
 *                                   type: array
 *                                   items:
 *                                     type: number
 *                                     example: [-74.0060, 40.7128]
 *                       distancia:
 *                         type: number
 *                         description: Distancia entre la ubicación solicitada y la ruta
 *                         example: 1113.19
 *       400:
 *         description: Coordenadas de latitud o longitud no válidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Debe proporcionar latitud y longitud válidas"
 *       404:
 *         description: No se encontraron rutas cercanas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No se encontraron rutas cercanas"
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
 */

router.get('/cercanas', async (req, res) => {
    try {
        const { lat, lng } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ message: "Debe proporcionar latitud y longitud válidas" });
        }

        const latitud = parseFloat(lat);
        const longitud = parseFloat(lng);

        if (isNaN(latitud) || isNaN(longitud)) {
            return res.status(400).json({ message: "Las coordenadas proporcionadas no son válidas" });
        }

        // Realizamos la búsqueda de rutas cercanas
        const rutasCercanas = await RutaSchema.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [latitud, longitud] }, // [longitud, latitud] es el formato requerido
                    distanceField: "distancia",  // El campo donde se almacenará la distancia calculada
                    maxDistance: 10000,  // Limita la distancia máxima (10 km en este caso)
                    spherical: true,  // Usa la geometría esférica para cálculos de distancia
                }
            },
            {
                $project: {
                    nombreRuta: 1,  // Solo selecciona el nombre de la ruta
                    paradas: 1,     // Incluye las paradas
                    distancia: 1,   // Incluye la distancia
                }
            }
        ]);

        // Si no se encuentran rutas cercanas
        if (rutasCercanas.length === 0) {
            return res.status(404).json({ message: "No se encontraron rutas cercanas" });
        }

        // Ahora, buscamos la parada más cercana en cada ruta
        const rutasConParadasCercanas = rutasCercanas.map(ruta => {
            // Calculamos la parada más cercana en cada ruta
            const paradaMasCercana = ruta.paradas.map(parada => {
                const distancia = calcularDistancia(latitud, longitud, parada.ubicacion.coordinates[1], parada.ubicacion.coordinates[0]);
                return { ...parada, distancia };
            }).reduce((prev, current) => (prev.distancia < current.distancia) ? prev : current);

            return { ...ruta, paradaMasCercana };
        });

        return res.status(200).json({ data: rutasConParadasCercanas });
    } catch (error) {
        console.error("Error en el servidor:", error);
        return res.status(500).json({ message: "Hubo un error en el servidor", error: error.message });
    }
});

// Función para calcular la distancia entre dos puntos (utilizando la fórmula de Haversine)
function calcularDistancia(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c; // Distancia en kilómetros
    return distancia;
}

//Este endpoint recoge las 5 paradas mas cercanas
//que debo hacer? una consulta a la base de datos extraer los datos y por cada dato de cada ruta hacer un calculo para verificar la distancia y hacer un sort de menor a mayor y hacer un slice y pasarlo al front end
//tengo que verificar alguna forma de que si la de metro esta como por ejemplo a 6km y la de bus a 5 priorizar tal vez la de metro porque vale la pena caminar ese km o con un uber porque tenicamente te ahorras mas tiempo
// Función para calcular el producto escalar de dos vectores
function productoEscalar(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
}

// Endpoint para obtener paradas cercanas en la dirección correcta
router.get('/PosiblesCercanas', async (req, res) => {
    try {
        const { lat, lng, destinoLat, destinoLng, circunstancia } = req.query;
        const response = [];

        // Vector dirección usuario → destino
        const vectorDestino = {
            x: destinoLat - lat,
            y: destinoLng - lng
        };

        const busMinimumDistance = 1; // Distancia de inicio de parada de un autobus

        // Consultar rutas de buses
        const rutas = await RutaSchema.find();
        rutas.forEach(ruta => {
            ruta.paradas.forEach(paradaActual => {
                const latitud = paradaActual.ubicacion.coordinates[0];
                const longitud = paradaActual.ubicacion.coordinates[1];
                const distancia = calcularDistancia(latitud, longitud, lat, lng);
                
                // Vector dirección usuario → parada
                const vectorParada = {
                    x: latitud - lat,
                    y: longitud - lng
                };

                // Verificar si la parada está en la dirección correcta

                if(circunstancia === 'inicio'){
                    if (productoEscalar(vectorDestino, vectorParada) > 0) {
                        response.push({
                            tipo: 'bus',
                            nombreRuta: ruta.nombreRuta,
                            nombreParada: paradaActual.nombre,
                            ubicacion: paradaActual.ubicacion.coordinates,
                            distancia
                        });
                    }
                } else {
                    response.push({
                        tipo: 'bus',
                        nombreRuta: ruta.nombreRuta,
                        nombreParada: paradaActual.nombre,
                        ubicacion: paradaActual.ubicacion.coordinates,
                        distancia
                    });
                }
            });
        });

        // Consultar rutas de metro
        const metros = await MetroRuta.find();
        metros.forEach(metro => {
            metro.paradas.forEach(paradaActual => {
                const latitud = paradaActual.ubicacion.coordinates[0];
                const longitud = paradaActual.ubicacion.coordinates[1];
                const distancia = calcularDistancia(latitud, longitud, lat, lng);
                
                // Vector dirección usuario → parada
                const vectorParada = {
                    x: latitud - lat,
                    y: longitud - lng
                };
                
                if(circunstancia === 'inicio'){
                    if (productoEscalar(vectorDestino, vectorParada) > 0) {
                        response.push({
                            tipo: 'metro',
                            nombreRuta: metro.nombreRuta,
                            nombreParada: paradaActual.nombre,
                            ubicacion: paradaActual.ubicacion.coordinates,
                            distancia
                        });
                    }
                }else {
                    response.push({
                        tipo: 'metro',
                        nombreRuta: metro.nombreRuta,
                        nombreParada: paradaActual.nombre,
                        ubicacion: paradaActual.ubicacion.coordinates,
                        distancia
                    });
                }
                // Verificar si la parada está en la dirección correcta
                
            });
        });

        // Ordenar por distancia de menor a mayor
        response.sort((a, b) => a.distancia - b.distancia);

        if (response.length === 0) {
            return res.status(404).json({ message: "No hay rutas cercanas en la dirección correcta" });
        }

        res.status(200).json({ message: response });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//Este endpoint recoge la parada mas cercana al destino del usuario en la que el usuario debe salir despues de tomar al metro en caso de que lo tome
router.get('/MetroSalida', async (req, res) => {
    try{
        const { lat, lng, destinoLat, destinoLng } = req.query;
        const response = [];

        // Vector dirección usuario → destino
        const vectorDestino = {
            x: destinoLat - lat,
            y: destinoLng - lng
        };

        const metros = await MetroRuta.find();
        metros.forEach(metro => {
            metro.paradas.forEach(paradaActual => {
                const latitud = paradaActual.ubicacion.coordinates[0];
                const longitud = paradaActual.ubicacion.coordinates[1];
                const distancia = calcularDistancia(latitud, longitud, lat, lng);
                
                // Vector dirección usuario → parada
                const vectorParada = {
                    x: latitud - lat,
                    y: longitud - lng
                };

                // Verificar si la parada está en la dirección correcta
                if (productoEscalar(vectorDestino, vectorParada) > 0) {
                    response.push({
                        tipo: 'metro',
                        nombreRuta: metro.nombreRuta,
                        nombreParada: paradaActual.nombre,
                        ubicacion: paradaActual.ubicacion.coordinates,
                        distancia
                    });
                }
            });
        });

    } catch(err){
        res.status(500).json({message: err})
    }
});



//PUEDE QUE SEA LITERALMENTE LO MISMO


// router.get('/PosiblesCercanasInicio', async (req,res) =>{
//     try{
//         const { destinolat, destinolng } = req.query;
//         const consulta = await RutaSchema.find()
//         const response = [];
//         consulta.map((ruta) =>{
//             ruta.paradas.map((paradaActual) =>{
//                 const paradaNombre = paradaActual.nombre
//                 const ubicacion = paradaActual.ubicacion.coordinates
//                 const latitud = paradaActual.ubicacion.coordinates[0];
//                 const longitud = paradaActual.ubicacion.coordinates[1];
//                 const distancia = calcularDistancia(latitud, longitud, destinolat, destinolng);
//                 console.log("Nombre de la ruta: "+ ruta.nombreRuta+ " Nombre de la parada "+ paradaNombre+ " latitud y longitud: "+ ubicacion + " La distancia entre los puntos es de KM: "+ distancia);
//                 if(distancia <= 6){
//                     response.push({nombreRuta: ruta.nombreRuta, nombreParada: paradaNombre, ubicacion: ubicacion, distancia: distancia});
//                 }
//             });
//         })

//         console.log(response)

//     res.status(200).json({message: consulta})
//     } catch(err){
//         res.status(500).json({message: err})
//     }
// })








/**
 * @swagger
 * /ruta/autobuses/{id}:
 *   get:
 *     summary: Obtener todos los autobuses asignados a una ruta específica
 *     description: Devuelve una lista de todos los autobuses asignados a una ruta, identificada por su ID.
 *     tags: [Ruta]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la ruta para obtener los autobuses asignados
 *         schema:
 *           type: string
 *           example: "67b58676a4da6e4181c9dbfb"  # Ejemplo de ID de ruta
 *     responses:
 *       200:
 *         description: Lista de autobuses asignados a la ruta
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
 *                     example: "1234abcd"
 *                   placa:
 *                     type: string
 *                     description: Número de placa del autobús
 *                     example: "ABC-123"
 *                   modelo:
 *                     type: string
 *                     description: Modelo del autobús
 *                     example: "Mercedes-Benz"
 *                   capacidad:
 *                     type: string
 *                     description: Capacidad de pasajeros del autobús
 *                     example: "50"
 *                   estado:
 *                     type: string
 *                     description: Estado del autobús (Activo/Inactivo)
 *                     enum: [Activo, Inactivo]
 *                     example: "Activo"
 *                   ubicacionActual:
 *                     type: string
 *                     description: Ubicación actual del autobús
 *                     example: "Terminal A"
 *                   fechaCreacion:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha de creación del autobús
 *                     example: "2025-02-19T07:21:26.922Z"
 *       404:
 *         description: Ruta no encontrada o sin autobuses asignados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ruta con ID 67b58676a4da6e4181c9dbfb no encontrada o sin autobuses asignados"
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
 *                   example: "Error al obtener autobuses desde la base de datos"
 */


router.get("/autobuses/:id", async (req, res) => {
    try {
        const routeId = req.params.id;

        const autobuses = await AutoBus.find({ idRuta: routeId });

        if (!autobuses || autobuses.length === 0) {
            return res.status(404).json({ message: `Ruta con ID ${routeId} no encontrada o sin autobuses asignados` });
        }

        res.status(200).json(autobuses);
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error });
    }
});

/**
 * @swagger
 * /ruta/tarifa/{id}:
 *   patch:
 *     summary: Actualizar solo la tarifa de una ruta
 *     description: Permite actualizar la tarifa de una ruta existente sin modificar otros campos.
 *     tags: [Ruta]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la ruta cuya tarifa será actualizada
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
 *               tarifa:
 *                 type: number
 *                 description: Nueva tarifa de la ruta
 *                 example: 25.50  # Ejemplo de tarifa
 *     responses:
 *       200:
 *         description: Tarifa actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tarifa actualizada con éxito"
 *                 updatedRoute:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: ID único de la ruta
 *                       example: "67b58676a4da6e4181c9dbfb"
 *                     tarifa:
 *                       type: number
 *                       description: Nueva tarifa de la ruta
 *                       example: 25.50
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
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Datos de tarifa inválidos"
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
 *                   example: "Error al actualizar la tarifa de la ruta"
 */ 



router.patch("/tarifa/:id", verificarRol(["Administrador"]), async (req, res) => {
    try {
        const routeId = req.params.id;
        const { tarifa } = req.body;

        if (tarifa === undefined || isNaN(tarifa)) {
            return res.status(400).json({ message: "Datos de tarifa inválidos" });
        }

        const selectedRoute = await RutaSchema.findById(routeId);
        if (!selectedRoute) {
            return res.status(404).json({ message: `Ruta con ID ${routeId} no encontrada` });
        }

        selectedRoute.tarifa = tarifa;

        const updatedRoute = await selectedRoute.save();

        res.status(200).json({
            message: "Tarifa actualizada con éxito",
            updatedRoute,
        });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error });
    }
});



module.exports = router;