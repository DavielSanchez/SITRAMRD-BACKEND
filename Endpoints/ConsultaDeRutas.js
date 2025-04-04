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



// Función para implementar Dijkstra considerando el modelo de Ruta
async function dijkstra(inicioId, destinoId) {
    const distancias = {};
    const previos = {};
    const visitados = new Set();
    distancias[inicioId] = 0;

    while (Object.keys(distancias).length > 0) {
        // Encuentra el nodo con la distancia más baja (minDistancia)
        let minDistancia = Infinity;
        let minNodoId = null;

        for (let nodoId in distancias) {
            if (!visitados.has(nodoId) && distancias[nodoId] < minDistancia) {
                minDistancia = distancias[nodoId];
                minNodoId = nodoId;
            }
        }

        if (minNodoId === destinoId) {
            // Reconstruir el camino
            let camino = [];
            let current = destinoId;
            while (current) {
                camino.unshift(current);
                current = previos[current];
            }
            return camino;
        }

        visitados.add(minNodoId);
        delete distancias[minNodoId];

        // Obtener las conexiones (paradas adyacentes) usando el modelo Ruta
        const nodo = await RutaSchema.findOne({ "paradas._id": minNodoId }).select('paradas').lean();
        if (!nodo) return null; // Si no se encuentra la ruta

        const paradaActual = nodo.paradas.find(p => p._id.toString() === minNodoId.toString());
        const indexParadaActual = nodo.paradas.findIndex(p => p._id.toString() === minNodoId.toString());

        const paradaSiguiente = nodo.paradas[indexParadaActual + 1]; // Si hay una parada siguiente en la ruta
        if (paradaSiguiente) {
            const tiempoEstimadoSiguiente = calcularTiempoEstimado(paradaActual, paradaSiguiente);
            const nuevaDistancia = distancias[minNodoId] + tiempoEstimadoSiguiente;

            if (nuevaDistancia < (distancias[paradaSiguiente._id] || Infinity)) {
                distancias[paradaSiguiente._id] = nuevaDistancia;
                previos[paradaSiguiente._id] = minNodoId;
            }
        }

        // Lo mismo para la parada anterior
        const paradaAnterior = nodo.paradas[indexParadaActual - 1]; // Si hay una parada anterior
        if (paradaAnterior) {
            const distanciaAnterior = calcularDistancia(paradaActual.ubicacion.coordinates[1], paradaActual.ubicacion.coordinates[0], paradaAnterior.ubicacion.coordinates[1], paradaAnterior.ubicacion.coordinates[0]);
            // const tiempoEstimadoAnterior = calcularTiempoEstimado(paradaActual, paradaAnterior); // Removed unused variable

            if (nuevaDistancia < (distancias[paradaAnterior._id] || Infinity)) {
                distancias[paradaAnterior._id] = nuevaDistancia;
                previos[paradaAnterior._id] = minNodoId;
            }
        }
    }

    return null; // No se encontró un camino
}

// Función para calcular la distancia entre dos puntos (usando la fórmula de Haversine)
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

// Función para calcular el tiempo estimado entre dos paradas
function calcularTiempoEstimado(paradaA, paradaB) {
    const velocidadPromedio = 40; // km/h

    // Obtener las coordenadas de ambas paradas
    const lat1 = paradaA.ubicacion.coordinates[1]; // latitud de la parada A
    const lng1 = paradaA.ubicacion.coordinates[0]; // longitud de la parada A
    const lat2 = paradaB.ubicacion.coordinates[1]; // latitud de la parada B
    const lng2 = paradaB.ubicacion.coordinates[0]; // longitud de la parada B

    // Calcular la distancia entre las paradas en kilómetros
    const distancia = calcularDistancia(lat1, lng1, lat2, lng2);

    // Calcular el tiempo estimado en horas, luego lo convertimos a minutos
    const tiempoEstimado = (distancia / velocidadPromedio) * 60; // en minutos

    return tiempoEstimado;
}

// Endpoint para obtener el mejor camino entre dos paradas
router.get('/mejorRuta', async (req, res) => {
    try {
        const { lat, lng, destinoLat, destinoLng } = req.query;

        // Obtener la parada más cercana al usuario utilizando Ruta
        const rutaInicio = await RutaSchema.findOne({
            "paradas.ubicacion.coordinates": {
                $near: {
                    $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                    $maxDistance: 1000 // 1 km de distancia máxima
                }
            }});

        // Obtener la parada más cercana al destino utilizando Ruta
        const rutaDestino = await RutaSchema.findOne({
            "paradas.ubicacion.coordinates": {
                $near: {
                    $geometry: { type: "Point", coordinates: [parseFloat(destinoLng), parseFloat(destinoLat)] },
                    $maxDistance: 1000 // 1 km de distancia máxima
                }
            }
        });

        if (!rutaInicio || !rutaDestino) {
            return res.status(404).json({ message: 'No se encontraron paradas cercanas.' });
        }

        // Ejecutar Dijkstra para encontrar la mejor ruta
        const ruta = await dijkstra(rutaInicio._id, rutaDestino._id);

        if (!ruta) {
            return res.status(404).json({ message: 'No se pudo encontrar una ruta entre las paradas.' });
        }

        // Retornar la ruta encontrada
        res.status(200).json({ ruta });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});




//Este endpoint recoge las 5 paradas mas cercanas
//que debo hacer? una consulta a la base de datos extraer los datos y por cada dato de cada ruta hacer un calculo para verificar la distancia y hacer un sort de menor a mayor y hacer un slice y pasarlo al front end
//tengo que verificar alguna forma de que si la de metro esta como por ejemplo a 6km y la de bus a 5 priorizar tal vez la de metro porque vale la pena caminar ese km o con un uber porque tenicamente te ahorras mas tiempo
// Función para calcular el producto escalar de dos vectores
function productoEscalar(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
}

router.get('/PosiblesCercanas', async (req, res) => {
    try {
        const { lat, lng, destinoLat, destinoLng, circunstancia } = req.query;
        const response = [];

        // Vector dirección usuario → destino
        const vectorDestino = {
            x: destinoLat - lat,
            y: destinoLng - lng
        };

        // Consultar rutas de buses
        const rutas = await RutaSchema.find();
        rutas.forEach(ruta => {
            ruta.paradas.forEach(paradaActual => {
                const latitud = paradaActual.ubicacion.coordinates[0];
                const longitud = paradaActual.ubicacion.coordinates[1];
                const distancia = calcularDistancia(latitud, longitud, lat, lng);
                
                // Calcular el tiempo estimado para llegar a la parada
                const tiempoEstimadoBus = calcularTiempoEstimado(distancia, 'bus');

                // Vector dirección usuario → parada
                const vectorParada = {
                    x: latitud - lat,
                    y: longitud - lng
                };

                if (circunstancia === 'inicio' && productoEscalar(vectorDestino, vectorParada) > 0) {
                    response.push({
                        tipo: 'bus',
                        nombreRuta: ruta.nombreRuta,
                        nombreParada: paradaActual.nombre,
                        ubicacion: paradaActual.ubicacion.coordinates,
                        distancia,
                        tiempoEstimado: tiempoEstimadoBus
                    });
                } else {
                    response.push({
                        tipo: 'bus',
                        nombreRuta: ruta.nombreRuta,
                        nombreParada: paradaActual.nombre,
                        ubicacion: paradaActual.ubicacion.coordinates,
                        distancia,
                        tiempoEstimado: tiempoEstimadoBus
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

                // Calcular el tiempo estimado para el metro
                const tiempoEstimadoMetro = calcularTiempoEstimado(distancia, 'metro');

                // Vector dirección usuario → parada
                const vectorParada = {
                    x: latitud - lat,
                    y: longitud - lng
                };

                if (circunstancia === 'inicio' && productoEscalar(vectorDestino, vectorParada) > 0) {
                    response.push({
                        tipo: 'metro',
                        nombreRuta: metro.nombreRuta,
                        nombreParada: paradaActual.nombre,
                        ubicacion: paradaActual.ubicacion.coordinates,
                        distancia,
                        tiempoEstimado: tiempoEstimadoMetro
                    });
                } else {
                    response.push({
                        tipo: 'metro',
                        nombreRuta: metro.nombreRuta,
                        nombreParada: paradaActual.nombre,
                        ubicacion: paradaActual.ubicacion.coordinates,
                        distancia,
                        tiempoEstimado: tiempoEstimadoMetro
                    });
                }
            });
        });

        // Ordenar por una combinación de distancia y tiempo estimado
        response.sort((a, b) => {
            // Primero ordenamos por tiempo estimado
            if (a.tiempoEstimado !== b.tiempoEstimado) {
                return a.tiempoEstimado - b.tiempoEstimado;
            }
            // Si el tiempo estimado es el mismo, ordenamos por distancia
            return a.distancia - b.distancia;
        });

        // Responder con las mejores paradas
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

router.get('/RutasAutoBus', async (req, res) => {
    try{
        const { lat, lng, destinoLat, destinoLng } = req.query;
        const inicioParada = []; 
        const inicioParadaDesAbordaje = [];
        const destinoParada = [];
        const ruta = await RutaSchema.find();
        ruta.map((ruta) => {

            //Codigo que recorre las rutas cercanas para ver la mas optima que se acople al eje al que quiere ir al usuario

            ruta.paradas.map((paradaActual) => {

                //Aqui defino la latitud en la que esta el map y la longitud

                let latitudDeLaParada = paradaActual.ubicacion.coordinates[0];
                let longitudDeLaParada = paradaActual.ubicacion.coordinates[1];

                //Aqui defino la distancia entre la parada de inicio y la parada de destino con la funcion

                let distanciaDeParadaInicio = calcularDistancia(latitudDeLaParada, longitudDeLaParada, lat, lng);
                let distanciaDeParadaFinal = calcularDistancia(latitudDeLaParada, longitudDeLaParada, destinoLat, destinoLng);

                //aqui todas las paradas cercanas de inicio las guardo en un array y las de destino en otro array

                inicioParada.push({Ruta: ruta.nombreRuta, Parada: paradaActual.nombre, ubicacion: {latitud: latitudDeLaParada, longitud: longitudDeLaParada}, distancia: distanciaDeParadaInicio})
                destinoParada.push({Ruta: ruta.nombreRuta, Parada: paradaActual.nombre, ubicacion: {latitud: latitudDeLaParada, longitud: longitudDeLaParada}, distancia: distanciaDeParadaFinal})
                
                
            })
        })


        // Aqui ordeno las paradas de inicio y destino por distancia para que me devuelva la mas cercana al usuario y la mas cercana al destino

        inicioParada.sort((a, b) => a.distancia - b.distancia);
        destinoParada.sort((a, b) => a.distancia - b.distancia);

        const paradaInicio = inicioParada[0]; // La parada más cercana al usuario
        const paradaDestino = destinoParada[0]; // La parada más cercana al usuario  

        //aqui obtengo la ruta de desabordaje tomando la parada de inicio y buscando una parada mas cercana al destino que tenga la misma ruta que la parada de inicio para que el usuario desaborde ahi

        inicioParada.map((parada) => {
            if(parada.Ruta === inicioParada[0].Ruta){
                parada.distancia = calcularDistancia(parada.ubicacion.latitud, parada.ubicacion.longitud, destinoLat, destinoLng);
                inicioParadaDesAbordaje.push({Ruta: parada.Ruta, Parada: parada.Parada, ubicacion: {latitud: parada.ubicacion.latitud, longitud: parada.ubicacion.longitud}, distancia: parada.distancia})
            }
        })
        inicioParadaDesAbordaje.sort((a, b) => a.distancia - b.distancia);

        //verificar si la ruta es directa y no hay necesidad de hacer conexiones

        console.log(paradaInicio.Ruta, paradaDestino.Ruta);

        if(paradaInicio.Ruta == paradaDestino.Ruta){
            return res.status(200).json({
                tipo: "Directa",
                "Parada De Inicio": paradaInicio,
                "Parada de destino": paradaDestino,
            })
        }

        // Aqui intentare hacer las conexiones

        let paradaIntermedia = null;
        let paradaFinal = null;

        // aqui hago un filtro para obtener todas las paradas perteneciente a la misma ruta del inicio

        let filtroParadasInicio = inicioParada.filter(p => p.Ruta === paradaInicio.Ruta)

        //aqui hago un filtro para obtener todas las paradas perteneciente a la misma ruta del final

        let filtroParadasDestino = destinoParada.filter(p => p.Ruta === paradaDestino.Ruta)

        //por cada parada con el mismo nombre que la parada de inicio

        let posiblesConexiones = [];

        for (let parada of filtroParadasInicio) {
            // Evitar que parada de bajada sea la misma que la parada de inicio
            if (
                parada.ubicacion.latitud === paradaInicio.ubicacion.latitud &&
                parada.ubicacion.longitud === paradaInicio.ubicacion.longitud
            ) continue;
        
            for (let posible of filtroParadasDestino) {
                const distEntreParadas = calcularDistancia(
                    parada.ubicacion.latitud,
                    parada.ubicacion.longitud,
                    posible.ubicacion.latitud,
                    posible.ubicacion.longitud
                );
        
                if (distEntreParadas <= 100) {
                    posiblesConexiones.push({
                        paradaIntermedia: parada,
                        paradaFinal: posible,
                        distanciaHaciaDestino: calcularDistancia(
                            parada.ubicacion.latitud,
                            parada.ubicacion.longitud,
                            destinoLat,
                            destinoLng
                        )
                    });
                }
            }
        }

        if (posiblesConexiones.length > 0) {
            posiblesConexiones.sort((a, b) => a.distanciaHaciaDestino - b.distanciaHaciaDestino);
        
            const mejorConexion = posiblesConexiones[0];
        
            return res.status(200).json({
                tipo: "Con Transbordo",
                "Parada De Inicio": paradaInicio,
                "Parada Intermedia (bajada)": mejorConexion.paradaIntermedia,
                "Parada Intermedia (subida)": mejorConexion.paradaFinal,
                "Parada De Destino": paradaDestino
            });
        }

        return res.status(404).json({ message: "No se encontró una ruta con transbordo cercano disponible." });

        // Aqui imprimo las paradas mas cercanas al usuario y al destino con index ya que es la mas cercana

        // res.status(200).json({"Parada De Inicio": paradaInicio, "Parada de desAbordaje": inicioParadaDesAbordaje[0], "Parada De Destino": paradaDestino, });

    }catch(Err){
        res.status(500).json({message: Err.message})
    }
})



module.exports = router;