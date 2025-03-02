const { Schema, model } = require("mongoose");

const rutaSchema = new Schema({
    nombreRuta: { type: String, required: true },

    coordenadas: {
        type: {
            type: String,
            enum: ["LineString"],
            default: "LineString",
        },
        coordinates: {
            type: [
                [Number]
            ],
            required: true,
        },
    },

    paradas: [{
        nombre: { type: String, required: true },
        ubicacion: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: { type: [Number], required: true },
        },
    }, ],

    Tarifa: { type: Number, required: true },

    fechaCreacion: { type: Date, default: Date.now },
});

rutaSchema.index({ "paradas.ubicacion": "2dsphere" });

module.exports = model("Ruta", rutaSchema);