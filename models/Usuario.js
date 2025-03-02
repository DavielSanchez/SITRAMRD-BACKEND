const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");
const Salting = 10;

// Seria bueno que adoptemos una sola Nomenclatura, yo apoyo el uso de 'camelCase' o podemos usar 'PascalCase', pero es factible que nos acoplemos solo a uno para mejor comprension y orden. -DAS-

const userSchema = new Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    contraseña: { type: String, required: true },
    userRol: { type: String, enum: ["Pasajero", "Operador", "Administrador"], default: "Pasajero" },
    userImage: { type: String, required: true },
    tarjetasVirtuales: [{
        tarjetaId: { type: Schema.Types.ObjectId, ref: 'tarjetasVirtuales' },
        tarjetaNombre: { type: String, required: false }
    }],
    tarjetasFisicas: [{
        tarjetaId: { type: Schema.Types.ObjectId, ref: 'tarjetasVirtuales' },
    }],
    customerId: { type: String, unique: true },
    estadoUsuario: { type: String, enum: ['activo', 'suspendido'], default: 'activo' },
    tema: { type: String, default: 'light' },
    metodosPago: [{
        paymentMethodId: { type: String },
        cardType: { type: String },
        last4: { type: String },
        expMonth: { type: Number },
        expYear: { type: Number },
        brand: { type: String },
    }],
    fechaCreacion: { type: Date, default: Date.now },
    lastLogin: { type: Date, required: false },
    fechaModificacion: { type: Date, default: Date.now },
    otpCode: { type: String },
    otpTimestamp: { type: Date },
});


// Middleware para el hash de la contraseña //
userSchema.pre("save", function(next) {
    if (this.isNew || this.isModified("contraseña")) {
        const document = this;

        // Verificar si la contraseña existe antes de hacer el hash //
        if (!document.contraseña) {
            return next(new Error("Contraseña es requerida"));
        }
        bcrypt.hash(document.contraseña, Salting, (error, hashedPassword) => {
            if (error) {
                next(error);
            } else {
                document.contraseña = hashedPassword;
                next();
            }
        });
    } else {
        next();
    }
});

// Método para comparar la contraseña introducida con la correcta //
userSchema.methods.isCorrectPassword = function(userPassword, callback) {
    bcrypt.compare(userPassword, this.contraseña, function(error, same) {
        if (error) {
            callback(error);
        } else {
            callback(null, same);
        }
    });
};

// Esta forma de exportar el modelo esta bien, pero puedes reducir aun mas este proceso a solo una linea. -DAS-
// module.export = model("Usuario", userSchema); -DAS-

module.exports = model("Usuario", userSchema);