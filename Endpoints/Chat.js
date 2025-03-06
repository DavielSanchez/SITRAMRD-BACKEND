const express = require("express");
const Chat = require("../models/Chat");
const Mensaje = require("../models/Mensaje")


const router = express.Router();

router.get("/obtener-chats-usuario/:userId", async(req, res) => {
    const { userId } = req.params; // Usar params en vez de body
    try {
        const chats = await Chat.find({ participantes: userId }).populate("participantes");
        res.json(chats);
    } catch (error) {
        console.error("Error al obtener los chats:", error);
        res.status(500).send("Error al obtener los chats.");
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


router.get("/obtener-mensajes/:chatId", async(req, res) => {
    try {
        const { chatId } = req.params;

        const mensajes = await Mensaje.find({ chatId })
            // .populate("remitente", "nombre_usuario")
            .sort({ fechaEnviado: -1 });

        if (mensajes.length === 0) {
            return res.status(404).json({ message: "No hay mensajes en este chat" });
        }

        res.status(200).json(mensajes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/crear-chat", async(req, res) => {
    try {
        const { tipo, participantes, nombre } = req.body;

        if (tipo === "grupo" && !nombre) {
            return res.status(400).json({ error: "El nombre es obligatorio para grupos" });
        }

        const nuevoChat = new Chat({ tipo, participantes, nombre });
        await nuevoChat.save();

        res.status(201).json(nuevoChat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/enviar-mensaje", async(req, res) => {
    try {
        const { texto, remitente, chatId, imagen } = req.body;

        // Validar si el chatId tiene el formato adecuado de ObjectId
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({ error: "El chatId proporcionado no es válido" });
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