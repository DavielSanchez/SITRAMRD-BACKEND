const express = require("express");
const Chat = require("../models/Chat");
const Mensaje = require("../models/Mensaje")


const router = express.Router();

router.get("/obtener-mensajes/:chatId", async(req, res) => {
    try {
        const { chatId } = req.params;

        const mensajes = await Mensaje.find({ chatId })
            .populate("remitente", "nombre_usuario")
            .sort({ fechaEnviado: 1 });

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

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(400).json({ error: "Chat no encontrado" });
        }

        const mensaje = new Mensaje({
            contenido: texto,
            imagenUrl: imagen,
            remitente,
            chatId,
        });

        await mensaje.save();

        // Devolver el mensaje enviado
        res.status(201).json(mensaje);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});







module.exports = router;