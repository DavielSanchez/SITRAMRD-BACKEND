const { Schema, model } = require("mongoose");

const recargaSchema = new Schema({
    id_usuario: { type: Schema.Types.ObjectId, ref: "Usuario" },
    id_tarjeta: { type: Schema.Types.ObjectId, ref: "Tarjeta" },
    monto_recargado: { type: Number, required: true },
    metodo_de_pago: { type: String, required: true },
    estado_recarga: { type: String, enum: ["Pendiente", "Completada", "Fallida"], required: true },
    fecha_recarga: { type: Date, default: Date.now }
});

module.exports = model("Recarga", recargaSchema);
