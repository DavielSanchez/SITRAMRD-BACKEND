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

const Tarjeta = model("Tarjeta", TarjetaSchema);
module.exports = Tarjeta;
