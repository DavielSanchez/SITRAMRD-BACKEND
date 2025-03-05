const { Schema, model } = require("mongoose");

const tarjetasVirtualesSchema = new Schema({
    idUsuario: { type: Schema.Types.ObjectId, ref: "Usuario" },
    tarjetaFisica: { type: Schema.Types.ObjectId, ref: 'tarjetasFisicas' },
    numeroTarjeta: { type: String, unique: true, required: true },
    estadoUsuario: { type: String, enum: ["Activa", "Inactiva"], default: "Activa", required: false },
    estadoAdmin: { type: String, enum: ["Activa", "Bloqueada"], default: "Activa", required: false },
    nombre: { type: String, required: false },
    saldo: { type: Number, required: false, default: 0 },
    fechaCreacion: { type: Date, default: Date.now },
    fechaModificacion: { type: Date, default: Date.now },
});

tarjetasVirtualesSchema.pre('save', function(next) {
    const now = Date.now();

    if (!this.fechaCreacion) {
        this.fechaCreacion = now;
    }

    this.fechaModificacion = now;

    next();
});

module.exports = model("tarjetasVirtuales", tarjetasVirtualesSchema);