const { Schema, model } = require("mongoose");

const pagoTarifaSchema = new Schema({
    idUsuario: { type: Schema.Types.ObjectId, ref: "Usuario" },
    idRuta: { type: Schema.Types.ObjectId, ref: "Ruta" },
    idAutobus: { type: Schema.Types.ObjectId, ref: "Autobus" },
    monto: { type: Number, required: true },
    metodoDePago: { type: String, required: true },
    estadoPago: { type: String, enum: ["Pendiente", "Pagado"], default: "Pagado" },
    fechaPago: { type: Date, required: true }
});

module.exports = model("pagoTarifa", pagoTarifaSchema);
