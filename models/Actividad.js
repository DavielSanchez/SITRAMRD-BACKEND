const { Schema, model } = require('mongoose')

const ActividadSchema = new Schema({
    idUsuario: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    calle: { type: String, required: true },
    fecha: { type: Date, default: Date.now, required: true },   
    hora: { type: String, required: true },
    precio: { type: Number, required: true },
    fotoUrl: {type: String, required: true},
    coordinates: { type: [Number], required: true },
    estado: { type: String, enum: ["Iniciado", "Cancelado", "Completado"], default: "Iniciado", required: false }
})

module.exports = model('Actividad', ActividadSchema);