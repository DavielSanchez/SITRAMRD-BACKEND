const MetroRuta = require("../models/Metro");
const express = require("express");
const router = express.Router();


router.get('/all', async (req,res) =>{
    MetroRuta.find().then((data) =>{
        res.status(200).json(data)
    })
})

router.get('/findOne', async (req, res) => {
    try {
        const { nombreRuta } = req.query;
        const resultado = await MetroRuta.findOne({ nombreRuta: nombreRuta });
        
        if (!resultado) {
            return res.status(404).json({ message: 'Ruta no encontrada' });
        }

        res.status(200).json({ message: resultado });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});


router.get('/findParades', async (req, res) => {
    try {
        const { nombreRuta } = req.query;
        const consulta = await MetroRuta.findOne({ nombreRuta: nombreRuta });
        const resultado = consulta.paradas
        
        if (!resultado) {
            return res.status(404).json({ message: 'Ruta no encontrada' });
        }

        res.status(200).json({ message: resultado });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

// Endpoint HARDCODEADO para agregar la l2
router.post('/l2/create', async (req, res) => {
    try {
        const nuevaRuta = new MetroRuta({
            nombreRuta: "Línea 2 Metro SD",
            coordenadas: {
                type: "LineString",
                coordinates: [
                    [18.478333, -69.968056], [18.479722, -69.961944], [18.481389, -69.954444],
                    [18.482500, -69.946389], [18.483611, -69.940556], [18.482500, -69.931944],
                    [18.482500, -69.920278], [18.482500, -69.915000], [18.482500, -69.906667],
                    [18.487500, -69.904444], [18.492778, -69.899167], [18.495556, -69.896111],
                    [18.498611, -69.891944], [18.504167, -69.883889], [18.506111, -69.879444],
                    [18.507778, -69.875833], [18.509444, -69.872222], [18.511111, -69.868611]
                ]
            },
            paradas: [
                { nombre: "María Montez", ubicacion: { type: "Point", coordinates: [18.478333, -69.968056] }, ordenParada: 1 },
                { nombre: "Pedro Francisco Bonó", ubicacion: { type: "Point", coordinates: [18.479722, -69.961944] }, ordenParada: 2 },
                { nombre: "Francisco Gregorio Billini", ubicacion: { type: "Point", coordinates: [18.481389, -69.954444] }, ordenParada: 3 },
                { nombre: "Ulises Francisco Espaillat", ubicacion: { type: "Point", coordinates: [18.482500, -69.946389] }, ordenParada: 4 },
                { nombre: "Pedro Mir", ubicacion: { type: "Point", coordinates: [18.483611, -69.940556] }, ordenParada: 5 },
                { nombre: "Freddy Beras Goico", ubicacion: { type: "Point", coordinates: [18.482500, -69.931944] }, ordenParada: 6 },
                { nombre: "Juan Ulises García Saleta", ubicacion: { type: "Point", coordinates: [18.482500, -69.920278] }, ordenParada: 7 },
                { nombre: "Juan Pablo Duarte", ubicacion: { type: "Point", coordinates: [18.482500, -69.915000] }, ordenParada: 8 },
                { nombre: "Coronel Rafael Tomás Fernández", ubicacion: { type: "Point", coordinates: [18.482500, -69.906667] }, ordenParada: 9 },
                { nombre: "Mauricio Báez", ubicacion: { type: "Point", coordinates: [18.487500, -69.904444] }, ordenParada: 10 },
                { nombre: "Ramón Cáceres", ubicacion: { type: "Point", coordinates: [18.492778, -69.899167] }, ordenParada: 11 },
                { nombre: "Horacio Vásquez", ubicacion: { type: "Point", coordinates: [18.495556, -69.896111] }, ordenParada: 12 },
                { nombre: "Manuel de Jesús Galván", ubicacion: { type: "Point", coordinates: [18.498611, -69.891944] }, ordenParada: 13 },
                { nombre: "Eduardo Brito", ubicacion: { type: "Point", coordinates: [18.504167, -69.883889] }, ordenParada: 14 },
                { nombre: "Ercilia Pepín", ubicacion: { type: "Point", coordinates: [18.506111, -69.879444] }, ordenParada: 15 },
                { nombre: "Rosa Duarte", ubicacion: { type: "Point", coordinates: [18.507778, -69.875833] }, ordenParada: 16 },
                { nombre: "Trina de Moya de Vásquez", ubicacion: { type: "Point", coordinates: [18.509444, -69.872222] }, ordenParada: 17 },
                { nombre: "Concepción Bona", ubicacion: { type: "Point", coordinates: [18.511111, -69.868611] }, ordenParada: 18 }
            ],
            Tarifa: 50,
            estado: "activa"
        });
        await nuevaRuta.save();
        res.status(201).json({ mensaje: "Ruta agregada exitosamente", ruta: nuevaRuta });
    } catch (error) {
        res.status(400).json({ mensaje: "Error al agregar la ruta", error });
    }
});


// Endpoint para agregar la Línea 1
router.post('/l1/create', async (req, res) => {
    try {
        const nuevaRuta = new MetroRuta({
            nombreRuta: "Línea 1 Metro SD",
            coordenadas: {
                type: "LineString",
                coordinates: [
                    [18.45101254541988, -69.92768946443111], [18.45618865811408, -69.92397308219921], [18.45970098259039, -69.91640573395514],
                    [18.46482637358861, -69.90999413418447], [18.471700150647813, -69.91175484961714], [18.47721833576976, -69.91410247025642],
                    [18.482010299757615, -69.91453626971439], [18.48653998962712, -69.91409073997418], [18.493900503431945, -69.91475449861498],
                    [18.499761071412795, -69.91565572083482], [18.507778329226543, -69.91576300920508], [18.518419946601128, -69.91494761768917],
                    [18.525526788607436, -69.91644491287906], [18.529536228657218, -69.9083566385878], [18.546955215714632, -69.90082083680029]
                ]
            },
            paradas: [
                { nombre: "Centro de los Héroes", ubicacion: { type: "Point", coordinates: [18.45101254541988, -69.92768946443111] }, ordenParada: 1 },
                { nombre: "Estación Francisco Alberto Caamaño Deñó", ubicacion: { type: "Point", coordinates: [18.45618865811408, -69.92397308219921] }, ordenParada: 2 },
                { nombre: "Amin Abel", ubicacion: { type: "Point", coordinates: [18.45970098259039, -69.91640573395514] }, ordenParada: 3 },
                { nombre: "Joaquín Balaguer", ubicacion: { type: "Point", coordinates: [18.46482637358861, -69.90999413418447] }, ordenParada: 4 },
                { nombre: "Casandra Damiron", ubicacion: { type: "Point", coordinates: [18.471700150647813, -69.91175484961714] }, ordenParada: 5 },
                { nombre: "Juan Bosch", ubicacion: { type: "Point", coordinates: [18.47721833576976, -69.91410247025642] }, ordenParada: 6 },
                { nombre: "Juan Pablo Duarte", ubicacion: { type: "Point", coordinates: [18.482010299757615, -69.91453626971439] }, ordenParada: 7 },
                { nombre: "Peña Battle", ubicacion: { type: "Point", coordinates: [18.48653998962712, -69.91409073997418] }, ordenParada: 8 },
                { nombre: "Pedro Livio Cedeno", ubicacion: { type: "Point", coordinates: [18.493900503431945, -69.91475449861498] }, ordenParada: 9 },
                { nombre: "Los Tainos", ubicacion: { type: "Point", coordinates: [18.499761071412795, -69.91565572083482] }, ordenParada: 10 },
                { nombre: "Maximo Gomez", ubicacion: { type: "Point", coordinates: [18.507778329226543, -69.91576300920508] }, ordenParada: 11 },
                { nombre: "Hermanas Mirabal", ubicacion: { type: "Point", coordinates: [18.518419946601128, -69.91494761768917] }, ordenParada: 12 },
                { nombre: "Jose Francisco Peña Gomez", ubicacion: { type: "Point", coordinates: [18.525526788607436, -69.91644491287906] }, ordenParada: 13 },
                { nombre: "Gregorio Luperon", ubicacion: { type: "Point", coordinates: [18.529536228657218, -69.9083566385878] }, ordenParada: 14 },
                { nombre: "Gregorio U. Gilbert", ubicacion: { type: "Point", coordinates: [18.546955215714632, -69.90082083680029] }, ordenParada: 15 },
            ],
            Tarifa: 20,
            estado: "activa"
        });
        await nuevaRuta.save();
        res.status(201).json({ mensaje: "Ruta agregada exitosamente", ruta: nuevaRuta });
    } catch (error) {
        res.status(400).json({ mensaje: "Error al agregar la ruta", error });
    }
});


module.exports = router;