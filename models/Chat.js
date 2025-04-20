const { Schema, model } = require("mongoose");

const chatSchema = new Schema({
    nombre: { type: String },
    tipo: { type: String, enum: ["privado", "grupo"], required: true },
    participantes: [{ type: Schema.Types.ObjectId, ref: "Usuario", required: true }],
    imagenUrl: { type: String, required: false },
    mensajes: [{ type: Schema.Types.ObjectId, ref: "Mensaje" }],
    creadoEn: { type: Date, default: Date.now },
});

module.exports = model("Chat", chatSchema);