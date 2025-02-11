const { Schema, model, default: mongoose } = require("mongoose");

const rutaSchema = new Schema({
    nombre_ruta: {
        type: String,
        required: true
    },

    //Considero que las paradas y coordenadas deberian ser array!!!

    // En verdad asi es como deberian ser, y creo que los pusieron asi en el diagrama. -DAS-

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

const Ruta = mongoose.model("Ruta", rutaSchema);

module.exports = Ruta;