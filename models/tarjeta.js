const { Schema, model } = require("mongoose");

const tarjetaSchema = new Schema({
  numeroTarjeta: { type: String, required: true },
  idUsuario: { type: Schema.Types.ObjectId, ref: "Usuario" },
  estado: { type: String, enum: ["Activa", "Inactiva"], default: "Activa", required: false },
  nombre: { type: String, required: false },
  balance: { type: Number, required: false, default: 0 },
});

module.exports = model("Tarjeta", tarjetaSchema); 
