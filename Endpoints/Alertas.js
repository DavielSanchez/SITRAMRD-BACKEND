const express = require("express");
const router = express.Router();
const UsuarioSchema = require("../models/Usuario")
const AlertaSchema = require("../models/Alertas")

router.get('/all', async(req, res) => {
    try {
        const alertas = await AlertaSchema.find();
        res.json(alertas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// router.post("/mis-alertas/generales", async(req, res) => {
//     try {
//         const { userId, userRol } = req.body;

//         if (!userId || !userRol) {
//             return res.status(400).json({ message: "userId y userRol son requeridos" });
//         }

//         const alertas = await AlertaSchema.find({
//             destinatarios: userId,
//             tipo_destinatario: 'todos' || 'operadores' || 'administradores' || 'conductores'
//         });

//         res.status(200).json(alertas);
//     } catch (err) {
//         console.error("Error al obtener alertas:", err);
//         res.status(500).json({ message: "Error del servidor" });
//     }
// });

router.post("/mis-alertas/generales", async(req, res) => {
    try {
        const { userId, userRol } = req.body;

        if (!userId || !userRol) {
            return res.status(400).json({ message: "userId y userRol son requeridos" });
        }

        const rolToTipoDestinatario = {
            Operador: 'operadores',
            Conductor: 'conductores',
            Administrador: 'administradores'
        };

        const tipoDestinatarioUsuario = rolToTipoDestinatario[userRol];

        const alertas = await AlertaSchema.find({
            $or: [
                { tipo_destinatario: 'todos' },
                { tipo_destinatario: tipoDestinatarioUsuario }
            ]
        });

        res.status(200).json(alertas);
    } catch (err) {
        console.error("Error al obtener alertas generales:", err);
        res.status(500).json({ message: "Error del servidor" });
    }
});

router.post("/mis-alertas/personales", async(req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "userId es requerido" });
        }

        const alertas = await AlertaSchema.find({
            destinatarios: userId,
            tipo_destinatario: 'usuario'
        });

        res.status(200).json(alertas);
    } catch (err) {
        console.error("Error al obtener alertas:", err);
        res.status(500).json({ message: "Error del servidor" });
    }
});

router.post("/mis-alertas/ruta", async(req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "userId es requerido" });
        }

        const alertas = await AlertaSchema.find({
            destinatarios: userId,
            tipo_destinatario: { $in: ['conductores_ruta', 'usuarios_ruta'] }
        });

        res.status(200).json(alertas);
    } catch (err) {
        console.error("Error al obtener alertas:", err);
        res.status(500).json({ message: "Error del servidor" });
    }
});

router.post("/no-leidas", async(req, res) => {
    try {
        const userId = req.body.userId;

        const alertasNoLeidas = await AlertaSchema.find({
            destinatarios: userId,
            leidaPor: { $ne: userId }
        });

        res.json(alertasNoLeidas);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener alertas no leídas", error });
    }
});


router.post('/add', async(req, res) => {
    try {
        const { titulo, descripcion, tipo, color, tipo_destinatario, ruta_id } = req.body;
        const creador_id = req.body.userId

        let destinatarios = [];

        if (tipo_destinatario === "todos") {
            destinatarios = await UsuarioSchema.find().select("_id");
        } else if (tipo_destinatario === "operadores" || tipo_destinatario === "conductores" || tipo_destinatario === "administradores") {
            destinatarios = await UsuarioSchema.find({ userRol: tipo_destinatario.slice(0, -1) }).select("_id");
        } else if (tipo_destinatario === "conductores_ruta") {
            if (!ruta_id) return res.status(400).json({ error: "Se requiere ruta_id para conductores de ruta" });
            destinatarios = await UsuarioSchema.find({ userRol: "Conductor", rutasAsignadas: ruta_id }).select("_id");
        } else if (tipo_destinatario === "usuario") {
            if (!req.body.destinatarios || !Array.isArray(req.body.destinatarios)) {
                return res.status(400).json({ error: "Lista de destinatarios inválida" });
            }
            destinatarios = req.body.destinatarios;
        }

        const alerta = new AlertaSchema({
            titulo,
            descripcion,
            tipo,
            color,
            creador_id,
            destinatarios: destinatarios.map(d => d._id ? d._id : d),
            tipo_destinatario,
            ruta_id: ruta_id || null,
        });

        await alerta.save();

        const destinatariosIds = destinatarios.map(d => d._id ? d._id.toString() : d.toString());

        const io = req.app.get('io');
        destinatariosIds.forEach(userId => {
            io.to(userId).emit('nueva_alerta', alerta);
        });

        res.status(201).json({ mensaje: "Alerta creada exitosamente", alerta });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
})

router.put("/marcar-leida", async(req, res) => {
    try {
        const { alertaId, userId } = req.body;

        await AlertaSchema.findByIdAndUpdate(alertaId, {
            $addToSet: { leidaPor: userId } // Agrega el usuario a 'leidaPor' solo si no está
        });

        res.json({ mensaje: "Alerta marcada como leída" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al marcar alerta como leída", error });
    }
});

router.put("/:id", async(req, res) => {
    try {
        const alertaActualizada = await AlertaSchema.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!alertaActualizada) return res.status(404).json({ mensaje: "Alerta no encontrada" });
        res.json(alertaActualizada);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar la alerta", error });
    }
});

router.delete("/:id", async(req, res) => {
    try {
        const alertaEliminada = await AlertaSchema.findByIdAndDelete(req.params.id);
        if (!alertaEliminada) return res.status(404).json({ mensaje: "Alerta no encontrada" });
        res.json({ mensaje: "Alerta eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar la alerta", error });
    }
});

module.exports = router;