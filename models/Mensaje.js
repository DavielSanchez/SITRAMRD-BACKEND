const { Schema, model } = require("mongoose");

const mensajeSchema = new Schema({
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    remitente: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    contenido: { type: String, required: false },
    imagenUrl: { type: String, required: false },
    enviadoEn: { type: Date, default: Date.now },
});

module.exports = model("Mensaje", mensajeSchema);