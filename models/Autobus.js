const { Schema, model } = require("mongoose");

const autobusSchema = new Schema({
    placa: { type: String, required: true, unique: true },
    modelo: { type: String, required: true },
    conductorAsignado: { type: Schema.Types.ObjectId, ref: "Usuario" },
    capacidad: { type: Number, required: true },
    estado: { type: String, enum: ["Activo", "Inactivo"], required: true },
    ubicacionActual: {
        type: { type: String, default: "Point" },
        coordinates: { type: [Number], required: true },
    },
    idRuta: { type: Schema.Types.ObjectId, ref: "Ruta" },
    fechaCreacion: { type: Date, required: true }
});

autobusSchema.index({ ubicacionActual: "2dsphere" });

module.exports = model("Autobus", autobusSchema);