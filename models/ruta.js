const { Schema, model, default: mongoose } = require("mongoose");

const ruta = new Schema({
    nombre_ruta: {
        type: String,
        required: true
    },
    //Considero que las paradas y coordenadas deberian ser array!!!
    paradas: {
        type: String,
        required: true
    },
    coordenadas: {
        type: String,
        required: true
    },
    fecha_creacion: {
        type: Date,
        default: Date.now
    }
})

const Ruta = mongoose.model("ruta", ruta);

module.exports = Ruta;