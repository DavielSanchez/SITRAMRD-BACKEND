const express = require('express');
const router = express.Router();
const Ruta = require('../models/Ruta');
const AutoBus = require('../models/Autobus');
const verificarRol = require('../middleware/verificarRol')

//AQUI ARRIBA DEBE IR LA TAREA DE DIEGO DE LA GESTION DE RUTAS PARA CREARLAS, ABAJO YO HAGO ALGUNOS ENDPOINTS DE RUTAS

router.post('/asignar', verificarRol(['Operador', 'Administrador']), async (req, res) => {
    try {
        const { rutaId, autobusId } = req.body; 

        const ruta = await Ruta.findById(rutaId);
        if (!ruta) {
            return res.status(404).json({ message: "Ruta no encontrada" });
        }

        const autoBus = await AutoBus.findById(autobusId);
        if (!autoBus) {
            return res.status(404).json({ message: "Autobus inexistente" });
        }

        autoBus.idRuta = rutaId;
        await autoBus.save();

        res.status(200).json({
            message: "Autobús asignado a la ruta correctamente",
            ruta,
            autoBus
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error en el servidor" });
    }
});


router.put('/modificar', (req,res) =>{
    
})


module.exports = router;