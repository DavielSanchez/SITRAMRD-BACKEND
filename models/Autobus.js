const { Schema, model } = require("mongoose");

const autobusSchema = new Schema({
    placa: { type: String, required: true, unique: true },
    modelo: { type: String, required: true },
    capacidad: { type: Number, required: true },
    estado: { type: String, enum: ["Activo", "Inactivo"], default: "Activo" },
    conductorAsignado: { type: Schema.Types.ObjectId, ref: "Usuario" },
    ubicacionActual: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [0, 0] },
    },
    rutaAsignada: { type: Schema.Types.ObjectId, ref: "Ruta" },
    fechaCreacion: { type: Date, default: Date.now }
});

autobusSchema.index({ ubicacionActual: "2dsphere" });

module.exports = model("Autobus", autobusSchema);