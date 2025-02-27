const { Schema, model } = require("mongoose");

//PSDT: Cambie un poco los campos para almacenar las coordenadas de cada parada para poder calcular mejor la distancia entre cada paradas y ver si asi se facilita a la hora del mapa.

const rutaSchema = new Schema({
  nombreRuta: { type: String, required: true },
  paradas: [
    {
      nombre: { type: String, required: true },
      coordenadas: { type: [Number], required: true },
    },
  ],
  fechaCreacion: { type: Date, default: Date.now },
});

module.exports = model("Ruta", rutaSchema);
