const { Schema, model } = require("mongoose");

const tarjetaTransaccionesSchema = new Schema({
    idUsuario: { type: Schema.Types.ObjectId, ref: "Usuario" },
    tarjetaVirtual: { type: Schema.Types.ObjectId, ref: 'tarjetasVirtuales' },
    ruta: { type: Schema.Types.ObjectId, ref: "Ruta", required: false },
    autobus: { type: Schema.Types.ObjectId, ref: "Autobus", required: false },
    tarjetaUID: { type: String, required: false },
    tipo: { type: String, enum: ['Recarga', 'Pago'] },
    monto: { type: Number, required: true },
    estado: { type: String, enum: ['Completado', 'Pendiente', 'Fallido'], default: 'Completado' },
    fecha: { type: Date, default: Date.now },
});

tarjetaTransaccionesSchema.pre('save', function(next) {
    const now = Date.now();

    if (!this.fecha) {
        this.fecha = now;
    }

    next();
});

module.exports = model("tarjetaTransacciones ", tarjetaTransaccionesSchema);