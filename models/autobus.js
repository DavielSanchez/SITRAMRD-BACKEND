const { Schema, model } = require("mongoose");

const autobusSchema = new Schema({
  placa: {
    type: String,
    required: true,
  },
  modelo: {
    type: String,
    required: true,
  },
  capacidad: {
    type: String,
    required: true,
  },
  estado: {
    type: String,
    enum: ["Activo", "Inactivo"],
    required: true,
  },
  id_ruta: {
    type: Schema.Types.ObjectId,
    ref: "ruta",
  },
  fecha_creacion: {
    type: Date,
    required: true,
  },
});

const AutoBus = mongoose.model("autobus", autobusSchema);

module.exports = AutoBus;