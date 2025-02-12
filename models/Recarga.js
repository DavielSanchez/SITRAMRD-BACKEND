const { Schema, model } = require("mongoose");

const recargaSchema = new Schema({
    idUsuario: { type: Schema.Types.ObjectId, ref: "Usuario" },
    idTarjeta: { type: Schema.Types.ObjectId, ref: "Tarjeta" },
    montoRecargado: { type: Number, required: true },
    metodoDePago: { type: String, required: true },
    estadoRecarga: { type: String, enum: ["Pendiente", "Completada", "Fallida"], required: true },
    fechaRecarga: { type: Date, default: Date.now }
});

module.exports = model("Recarga", recargaSchema);
