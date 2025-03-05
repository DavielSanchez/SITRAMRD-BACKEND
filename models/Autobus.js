const { Schema, model } = require("mongoose");

const autobusSchema = new Schema({
    placa: { type: String, required: true, unique: true },
    modelo: { type: String, required: true },
<<<<<<< HEAD
    capacidad: { type: Number, required: true },
    estado: { type: String, enum: ["Activo", "Inactivo"], required: true },
    ubicacionActual: {
        lat: { type: Number, required: false },
        lon: { type: Number, required: false }
    },
    idRuta: { type: Schema.Types.ObjectId, ref: "Ruta", required: false },
    fechaCreacion: { type: Date, default: Date.now }
});

module.exports = model("Autobus", autobusSchema);
=======
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
>>>>>>> develop
