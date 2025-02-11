const { Schema, model, default: mongoose } = require("mongoose");
const bcrypt = require("bcrypt");

const tarjetaSchema = new Schema({
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
        default: 'Activa',
        required: false
    },
    balance: {
        type: Number,
        required: false,
        default: 0
    },
    nombre: {
        type: String,
        required: false,
    },
});

const Tarjeta = model("Tarjeta", tarjetaSchema);
module.exports = Tarjeta;