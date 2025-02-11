const { Schema, model } = require("mongoose");

const pagoTarifaSchema = new Schema({
    id_usuario: { type: Schema.Types.ObjectId, ref: "Usuario" },
    id_ruta: { type: Schema.Types.ObjectId, ref: "Ruta" },
    id_autobus: { type: Schema.Types.ObjectId, ref: "Autobus" },
    monto: { type: Number, required: true },
    metodo_de_pago: { type: String, required: true },
    estado_pago: { type: String, enum: ["Pendiente", "Pagado"], default: "Pagado" },
    fecha_pago: { type: Date, required: true }
});

module.exports = model("pagoTarifa", pagoTarifaSchema);
