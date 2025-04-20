const mongoose = require("mongoose");

const alertaSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    descripcion: { type: String, required: true },
    tipo: {
        type: String,
        enum: ["emergencia", "trafico", "clima", "operativa", "informativa", "incidencia"],
        required: true
    },
    fecha_creacion: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: false },
    destinatarios: [{ type: mongoose.Schema.Types.ObjectId, ref: "Usuario" }],
    tipo_destinatario: {
        type: String,
        enum: ["todos", "operadores", "conductores", "conductores_ruta", "usuarios_ruta", "usuario", "administradores"],
        required: true
    },
    ruta_id: { type: mongoose.Schema.Types.ObjectId, ref: "Ruta", default: null },
    estado: {
        type: String,
        enum: ["activa", "expirada"],
        default: "activa"
    },
    leidaPor: [{ type: mongoose.Schema.Types.ObjectId, ref: "Usuario" }]
});

module.exports = mongoose.model("Alerta", alertaSchema);