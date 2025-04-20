const { Schema, model } = require("mongoose");

const tarjetasFisicasSchema = new Schema({
    idUsuario: { type: Schema.Types.ObjectId, ref: "Usuario" },
    tarjetaUID: { type: String, required: false },
    numeroTarjeta: { type: String, unique: true, required: true },
    tarjetaVirtual: { type: Schema.Types.ObjectId, ref: "tarjetasVirtuales", required: false },
    estadoUsuario: { type: String, enum: ["Activa", "Inactiva"], default: "Activa", required: false },
    estadoAdmin: { type: String, enum: ["Activa", "Bloqueada"], default: "Activa", required: false },
    fechaCreacion: { type: Date, default: Date.now },
    fechaModificacion: { type: Date, default: Date.now },
});

tarjetasFisicasSchema.pre('save', function(next) {
    const now = Date.now();

    if (!this.fechaCreacion) {
        this.fechaCreacion = now;
    }

    this.fechaModificacion = now;

    next();
});

module.exports = model("tarjetasFisicas", tarjetasFisicasSchema);