const { Schema, model } = require('mongoose');

const rutaSchema = new Schema({
    nombreRuta: { type: String, required: true },
    coordenadas: {
        type: { type: String, enum: ["LineString"], default: "LineString" },
        coordinates: {
            type: [
                [Number]
            ],
            required: true
        }
    },
    paradas: [{
        nombre: { type: String, required: false },
        descripcion: { type: String, required: false },
        ubicacion: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: { type: [Number], required: true },
            ordenParada: { type: Number, required: false },
        },
    }],
    tipo: { type: String, enum: ['Corredor', 'Metro', 'Teleferico'], default: 'Corredor', required: true },
    Tarifa: { type: Number, required: true },
    estado: { type: String, enum: ['activa', 'inactiva', 'bloqueada'], default: 'activa' },
    fechaCreacion: { type: Date, default: Date.now },
});

rutaSchema.index({ "paradas.ubicacion": "2dsphere" });

module.exports = model('Ruta', rutaSchema);