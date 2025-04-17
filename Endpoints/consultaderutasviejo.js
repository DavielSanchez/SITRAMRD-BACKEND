const express = require("express");
const router = express.Router();
const RutaSchema = require("../models/Ruta");
const AutoBus = require("../models/Autobus");
const verificarRol = require("../middleware/verificarRol");
const MetroRuta = require("../models/Metro");
const Ruta = require("../models/Ruta");


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

function productoEscalar(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
}

// Función para encontrar la parada más cercana (de bus o metro)
async function encontrarParadaMasCercana(lat, lng, destinoLat, destinoLng, circunstancia) {
    const response = [];

    // Vector dirección usuario → destino
    const vectorDestino = {
        x: destinoLng - lng,
        y: destinoLat - lat
    };

    // Consultar rutas de buses
    const rutas = await RutaSchema.find();
    rutas.forEach(ruta => {
        ruta.paradas.forEach(paradaActual => {
            const latitud = paradaActual.ubicacion.coordinates[1];
            const longitud = paradaActual.ubicacion.coordinates[0];
            const distancia = calcularDistancia(lat, lng, latitud, longitud);
            

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
                    distancia
                });
            } else if (circunstancia === 'final' && productoEscalar(vectorDestino, vectorParada) < 0) {
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
            const latitud = paradaActual.ubicacion.coordinates[1];
            const longitud = paradaActual.ubicacion.coordinates[0];
            const distancia = calcularDistancia(lat, lng, latitud, longitud);

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
                    distancia
                });
            } else if (circunstancia === 'final' && productoEscalar(vectorDestino, vectorParada) < 0) {
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


    if(circunstancia === 'inicio') {
        response.sort((a, b) => a.distancia - b.distancia);
    } else {
        response.sort((a, b) => b.distancia - a.distancia);
    }

    // Si no se encuentran paradas cercanas, retornar un mensaje
    if (response.length === 0) {
        throw new Error("No hay rutas cercanas en la dirección correcta");
    }

    // Priorizar buses si hay paradas de ambos tipos a la misma distancia
    const paradaMasCercana = response.find(parada => parada.tipo === 'bus') || response[0];

    return paradaMasCercana; // Retorna la parada más cercana
}

//Este endpoint recoge las 5 paradas mas cercanas
router.get('/MejorRuta', async (req, res) => {
    try {
        // Convertir parámetros de la query a números
        const lat = parseFloat(req.query.lat);
        const lng = parseFloat(req.query.lng);
        const destinoLat = parseFloat(req.query.destinoLat);
        const destinoLng = parseFloat(req.query.destinoLng);

        if (isNaN(lat) || isNaN(lng) || isNaN(destinoLat) || isNaN(destinoLng)) {
            return res.status(400).json({ message: "Faltan parámetros en la solicitud o son inválidos" });
        }

        // Llamar a la función para encontrar la parada más cercana de bus
        const paradaMasCercana = await encontrarParadaMasCercana(lat, lng, destinoLat, destinoLng, 'inicio');
        const paradaMasCercanaAlDestino = await encontrarParadaMasCercana(destinoLat, destinoLng, lat, lng, 'final');

        res.status(200).json({
            inicio: paradaMasCercana, // Retorna la parada más cercana al usuario
            final: paradaMasCercanaAlDestino // Retorna la parada más cercana al destino
        });

    } catch (err) {
        console.error("Error in /MejorRuta endpoint:", err); // Log the error for debugging
        res.status(500).json({ message: "Hubo un error al procesar la solicitud", error: err.message });
    }
});


// Removed duplicate definition of calcularDistancia


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

        if (paradaInicio.Ruta == paradaDestino.Ruta) {
            return res.status(200).json({
                tipo: "Directa",
                "Parada De Inicio": paradaInicio,
                "Parada de destino": paradaDestino,
            });
        }
        
        // Construcción del grafo de rutas conectadas a pie (por paradas cercanas <= 100m)
        const grafoRutas = new Map();
        
        // Agrupar todas las paradas por ruta
        const paradasPorRuta = {};
        ruta.forEach(r => {
            paradasPorRuta[r.nombreRuta] = r.paradas.map(p => ({
                nombre: p.nombre,
                ubicacion: {
                    latitud: p.ubicacion.coordinates[0],
                    longitud: p.ubicacion.coordinates[1],
                }
            }));
        });
        
        const rutas = Object.keys(paradasPorRuta);
        
        // Crear conexiones entre rutas si tienen paradas cercanas
        for (let i = 0; i < rutas.length; i++) {
            for (let j = i + 1; j < rutas.length; j++) {
                const rutaA = rutas[i];
                const rutaB = rutas[j];
        
                for (let paradaA of paradasPorRuta[rutaA]) {
                    for (let paradaB of paradasPorRuta[rutaB]) {
                        const distancia = calcularDistancia(
                            paradaA.ubicacion.latitud,
                            paradaA.ubicacion.longitud,
                            paradaB.ubicacion.latitud,
                            paradaB.ubicacion.longitud
                        );
                        if (distancia <= 600 && paradaA.nombre !== paradaB.nombre) {
                            console.log(`Conectando ${rutaA} (${paradaA.nombre}) con ${rutaB} (${paradaB.nombre}) - Distancia: ${distancia}m`);
                            if (!grafoRutas.has(rutaA)) grafoRutas.set(rutaA, []);
                            if (!grafoRutas.has(rutaB)) grafoRutas.set(rutaB, []);
        
                            grafoRutas.get(rutaA).push({ ruta: rutaB, desde: paradaA, hacia: paradaB });
                            grafoRutas.get(rutaB).push({ ruta: rutaA, desde: paradaB, hacia: paradaA });
                        }
                    }
                }
            }
        }
        
        // BFS para encontrar una cadena de rutas desde la ruta de inicio hasta la de destino
        const queue = [{
            ruta: paradaInicio.Ruta,
            camino: [],
            ultimaParada: paradaInicio
        }];
        
        const visitadas = new Set();
        
        while (queue.length > 0) {
            const actual = queue.shift();
            const rutaActual = actual.ruta;
        
            if (visitadas.has(rutaActual)) continue;
            visitadas.add(rutaActual);
        
            const conexiones = grafoRutas.get(rutaActual) || [];
        
            for (let conexion of conexiones) {
                const nuevoCamino = [...actual.camino, {
                    desdeRuta: rutaActual,
                    desdeParada: conexion.desde,
                    haciaRuta: conexion.ruta,
                    haciaParada: conexion.hacia
                }];
        
                if (conexion.ruta === paradaDestino.Ruta) {
                    // Se encontró una ruta hacia el destino
                    return res.status(200).json({
                        tipo: "Múltiples Transbordos",
                        "Parada De Inicio": paradaInicio,
                        trayecto: [
                            ...nuevoCamino.map(p => ({
                                "Desde Ruta": p.desdeRuta,
                                "Parada de Bajada": p.desdeParada,
                                "Hacia Ruta": p.haciaRuta,
                                "Parada de Subida": p.haciaParada
                            })),
                            {
                                "Ruta Final": paradaDestino.Ruta,
                                "Parada Destino": paradaDestino
                            }
                        ]
                    });
                }
        
                queue.push({
                    ruta: conexion.ruta,
                    camino: nuevoCamino,
                    ultimaParada: conexion.hacia
                });
            }
        }
        
        return res.status(404).json({ message: "No se encontró una ruta con transbordo cercano disponible." });
        

    }catch(Err){
        res.status(500).json({message: Err.message})
    }
})































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