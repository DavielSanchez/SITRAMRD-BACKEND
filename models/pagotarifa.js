const { Schema, model } = require("mongoose");

const pagotarifa = new Schema({
  id_usuario: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
  },
  id_ruta: {
    type: Schema.Types.ObjectId,
    ref: "ruta",
  },
  monto: {
    type: Number,
    required: true,
  },
  estado_pago: {
    type: String,
    enum: ["Pendiente", "Pagadao"],
    default: "Pagado"
  },
  fecha_pago: {
    type: Date,
    required: true,
  },
  metodo_de_pago: {
    type: String,
    required: true,
  },
  id_autobus: {
    type: Schema.Types.ObjectId,
    ref: "autobus",
  },
});

const PagoTarifa = mongoose.model("pagotarifa", pagotarifa);

module.exports = PagoTarifa;
