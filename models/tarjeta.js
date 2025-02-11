const { Schema, model } = require("mongoose");

const tarjetaSchema = new Schema({
  numero_tarjeta: { type: String, required: true },
  id_usuario: { type: Schema.Types.ObjectId, ref: "Usuario" },
  estado: { type: String, enum: ["Activa", "Inactiva"], default: "Activa", required: false },
  nombre: { type: String, required: false },
  balance: { type: Number, required: false, default: 0 },   
});

module.exports = model("Tarjeta", tarjetaSchema); 