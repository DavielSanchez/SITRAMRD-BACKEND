const { Schema, model, default: mongoose } = require("mongoose");
const bcrypt = require("bcrypt");

const TarjetaSchema = new Schema({
  numero_tarjeta: {
    type: String,
    required: true,
  },
  id_usuario: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
  },
  fecha_emision: {
    type: Date,
    required: true,
  },
  estado: { 
    type: String,
    enum: ["Activa", "Inactiva"],
    required: true
   },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  nombre: {
    type: String,
    required: true,
  },
});

TarjetaSchema.pre("save", async function (next) {
  if (!this.isModified("numero_tarjeta")) return next();
  this.numero_tarjeta = await bcrypt.hash(this.numero_tarjeta, 10);
  next();
});

const Tarjeta = model("Tarjeta", TarjetaSchema);
module.exports = Tarjeta;
