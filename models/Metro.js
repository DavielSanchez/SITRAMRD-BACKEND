const { Schema, model } = require('mongoose');

const metroSchema = new Schema({
    nombreRuta: { type: String, required: true, default: "Línea 2 Metro SD" },
    coordenadas: {
        type: { type: String, enum: ["LineString"], default: "LineString" },
        coordinates: { type: [[Number]], required: true }
    },
    paradas: [
        {
            nombre: { type: String, required: true },
            descripcion: { type: String, required: false },
            ubicacion: {
                type: {
                    type: String,
                    enum: ["Point"],
                    default: "Point",
                },
                coordinates: { type: [Number], required: true },
            },
            ordenParada: { type: Number, required: true }
        }
    ],
    Tarifa: { type: Number, required: true },
    estado: { type: String, enum: ['activa', 'inactiva'], default: 'activa' },
    fechaCreacion: { type: Date, default: Date.now },
});

metroSchema.index({ "paradas.ubicacion": "2dsphere" });

module.exports = model('MetroRuta', metroSchema);