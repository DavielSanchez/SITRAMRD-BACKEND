const { model, Schema } = require('mongoose');

const IncidenciaSchema = new Schema({
    idRuta: { type: Schema.Types.ObjectId, ref: "Ruta" },
    descripcion: { type: String, required: true },
    reportadoPor: { type: Schema.Types.ObjectId, ref: "Usuario" },
    idAutoBus: { type: Schema.Types.ObjectId, ref: "AutoBus" },
    fechaDeReporte: { type: Date, default: Date.now() },
    evidencia: [String],
    estado: {
        type: String,
        enum: ['Pendiente', 'Resuelto', 'En Proceso'],
        default: 'Pendiente'
    }
});

module.exports = model("Incidencias", IncidenciaSchema);