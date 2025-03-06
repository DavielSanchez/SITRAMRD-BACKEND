const { Schema, model } = require("mongoose");

const autobusSchema = new Schema({
    placa: { type: String, required: true, unique: true },
    modelo: { type: String, required: true },
    capacidad: { type: Number, required: true },
    estado: { type: String, enum: ["Activo", "Inactivo"], required: true },
    conductorAsignado: { type: Schema.Types.ObjectId, ref: "Usuario", required: false },
    ubicacionActual: {
        type: { type: String, default: "Point" },
        coordinates: { type: [Number], required: false }, // Latitud y longitud
    },
    idRuta: { type: Schema.Types.ObjectId, ref: "Ruta", required: false },
    fechaCreacion: { type: Date, default: Date.now }
});

autobusSchema.index({ ubicacionActual: "2dsphere" });

module.exports = model("Autobus", autobusSchema);
