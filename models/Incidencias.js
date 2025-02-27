const { model, Schema } = require('mongoose');

const IncidenciaSchema = new Schema({
    descripcion: { type: String, required: true },
    idUsuario: { type: Schema.Types.ObjectId, ref: "Usuario" },
    idAutoBus: { type: Schema.Types.ObjectId, ref: "AutoBus" },
    fechaDeReporte: { type: Date, default: Date.now() },
    estado: { 
        type: String, 
        enum: ['Pendiente', 'Resuelto', 'En Proceso'], // Puedes añadir más estados si lo deseas
        default: 'Pendiente' // Valor por defecto
    }
});

module.exports = model("IncidenciaSchema", IncidenciaSchema);
