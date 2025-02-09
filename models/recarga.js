const { Schema, model } = require("mongoose");

const recarga = new Schema({
  id_usuario: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
  },
  monto_recargado: {
    type: Number,
    required: true,
  },
  fecha_recarga: {
    type: Date,
    default: Date.now
  },
  metodo_de_pago: {
    type: String,
    required: true,
  },
  estado_recarga: {
    type: String,
    enum: ["Pendiente", "Completada", "Fallida"],
    required: true,
  },
  id_tarjeta: {
    type: Schema.Types.ObjectId,
    ref: "tarjeta",
  },
});

const Recarga = mongoose.model("recarga", recarga);

module.exports = Recarga;
