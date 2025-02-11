const { Schema, model } = require("mongoose");

const rutaSchema = new Schema({
    nombre_ruta: { type: String, required: true },
    paradas: [{ type: String, required: true }], 
    coordenadas: [{ type: String, required: true }],
    fecha_creacion: { type: Date, default: Date.now }
});

module.exports = model("Ruta", rutaSchema);
