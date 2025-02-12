const { Schema, model } = require("mongoose");

const rutaSchema = new Schema({
    nombreRuta: { type: String, required: true },
    paradas: [{ type: String, required: true }],
    coordenadas: [{ type: String, required: true }],
    fechaCreacion: { type: Date, default: Date.now }
});

module.exports = model("Ruta", rutaSchema);
