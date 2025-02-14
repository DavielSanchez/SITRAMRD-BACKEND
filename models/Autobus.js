const { Schema, model } = require("mongoose");

const autobusSchema = new Schema({
    placa: { type: String, required: true },
    modelo: { type: String, required: true },
    capacidad: { type: String, required: true },
    estado: { type: String, enum: ["Activo", "Inactivo"], required: true },
    ubicacionActual: { type: String, required: false },
    idRuta: { type: Schema.Types.ObjectId, ref: "Ruta" },
    fechaCreacion: { type: Date, required: true }
});

module.exports = model("Autobus", autobusSchema);