const express = require("express");
const { Schema, model, Types } = require("mongoose");
const Chat = require("../models/Chat");
const Mensaje = require("../models/Mensaje")


const router = express.Router();

router.get("/obtener-chats-usuario/:userId", async(req, res) => {
    try {
        const chats = await Chat.find({ participantes: req.params.userId })
            .populate("participantes", "nombre userImage")
            .populate({
                path: "mensajes",
                populate: {
                    path: "usuario",
                    select: "nombre"
                }
            });

        // Mapeamos los chats para estructurar los datos correctamente
        const chatsConDetalles = chats.map(chat => {
            if (chat.participantes.length === 2) {
                const otroUsuario = chat.participantes.find(p => p._id.toString() !== req.params.userId);
                chat.nombre = otroUsuario ? otroUsuario.nombre : "Chat privado";
                chat.userImage = otroUsuario ? otroUsuario.userImage : null;
            } else {
                chat.nombre = chat.nombre || "Grupo sin nombre";
                chat.userImage = null;
            }

            return chat;
        });

        res.json(chatsConDetalles);
    } catch (error) {
        console.error("Error al obtener chats:", error);
        res.status(500).send("Error al obtener los chats");
    }
});

router.get("/obtener-mensajes/:chatId", async(req, res) => {
    try {
        const { chatId } = req.params;
        const { usuarioId } = req.query;

        const mensajes = await Mensaje.find({ chatId })
            // .populate("remitente", "nombre_usuario")
            .sort({ fechaEnviado: -1 });

        if (mensajes.length === 0) {
            return res.status(404).json({ message: "No hay mensajes en este chat" });
        }

        const mensajesConEstadoLeido = mensajes.map(mensaje => {
            // Verificar si el usuario ha leído este mensaje
            const leidoPorUsuario = mensaje.leidoPor.some(entry => entry.userId.toString() === usuarioId && entry.leido);
            return {
                ...mensaje.toObject(),
                leidoPorUsuario
            };
        });

        res.status(200).json(mensajesConEstadoLeido);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/obtener-mensajes/no-leidos/:userId", async(req, res) => {
    try {
        const { userId } = req.params;

        const mensajesNoLeidos = await Mensaje.find({
            receptores: { $in: [userId] },
            $or: [
                { leidoPor: { $size: 0 } },
                { "leidoPor.userId": { $ne: userId } }
            ]
        }).sort({ enviadoEn: 1 });

        if (mensajesNoLeidos.length === 0) {
            return res.status(404).json({ message: "No hay mensajes no leídos para este usuario" });
        }

        res.status(200).json(mensajesNoLeidos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/obtener-chat-por-usuarios', async(req, res) => {
    const { emisor, receptor } = req.body;

    try {
        // Buscar un chat donde los dos usuarios estén en el array 'participantes'
        const chat = await Chat.findOne({
            participantes: { $all: [emisor, receptor] } // Aseguramos que ambos usuarios estén en el chat
        });

        if (chat) {
            return res.json(chat);
        } else {
            return res.status(404).json({ message: "No se encontró un chat entre estos usuarios" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor" });
    }
});

router.post("/obtener-chat-privados", async(req, res) => {
    const { emisor, receptor } = req.body;

    try {
        // Buscar un chat privado entre los dos usuarios
        const chat = await Chat.findOne({
            tipo: "privado",
            participantes: { $all: [emisor, receptor] },
        });

        if (chat) {
            return res.json(chat);
        }

        res.status(404).json({ error: "No se encontró el chat" }); // Si no existe
    } catch (error) {
        console.error("Error al buscar el chat:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

router.post("/crear-chat", async(req, res) => {
    try {
        const { tipo, participantes, nombre, imagenUrl } = req.body;

        if (tipo === "grupo" && !nombre) {
            return res.status(400).json({ error: "El nombre es obligatorio para grupos" });
        }

        const nuevoChat = new Chat({
            tipo,
            participantes,
            nombre,
            imagenUrl: imagenUrl || 'https://res.cloudinary.com/dv4wfetu1/image/upload/v1740610245/avatar_qspfc1.svg'
        });
        await nuevoChat.save();

        res.status(201).json(nuevoChat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/marcar-como-leido', async(req, res) => {
    try {
        const { mensajeId, usuarioId } = req.body;

        if (!Types.ObjectId.isValid(mensajeId) || !Types.ObjectId.isValid(usuarioId)) {
            return res.status(400).json({ error: 'Ids no válidos' });
        }

        // Actualizar el mensaje en una sola consulta
        const mensajeActualizado = await Mensaje.findOneAndUpdate({ _id: mensajeId, 'leidoPor.userId': usuarioId }, { $set: { 'leidoPor.$.leido': true } }, { new: true });

        if (!mensajeActualizado) {
            // Si el usuario no estaba en leidoPor, lo agregamos
            const mensajeNuevo = await Mensaje.findByIdAndUpdate(
                mensajeId, { $push: { leidoPor: { userId: usuarioId, leido: true } } }, { new: true }
            );

            if (!mensajeNuevo) return res.status(404).json({ error: 'Mensaje no encontrado' });

            return res.status(200).json({ mensaje: 'Mensaje actualizado', data: mensajeNuevo });
        }

        res.status(200).json({ mensaje: 'Mensaje actualizado', data: mensajeActualizado });
    } catch (error) {
        console.error('Error al marcar como leído:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

router.post("/enviar-mensaje", async(req, res) => {
    try {
        const { texto, remitente, chatId, imagen } = req.body;

        // Validar si el chatId tiene el formato adecuado de ObjectId
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({ error: "El chatId que proporcionaste no es válido" });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(400).json({ error: "Chat no encontrado" });
        }

        const mensaje = new Mensaje({
            contenido: texto,
            imagenUrl: imagen,
            remitente,
            chatId: new mongoose.Types.ObjectId(chatId),
        });

        await mensaje.save();

        // Devolver el mensaje enviado
        res.status(201).json(mensaje);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




module.exports = router;