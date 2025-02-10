const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const Salting = 10;

const userSchema = new Schema({
  nombre: {
    type: String,
    required: true,
  },
  apellido: {
    type: String,
    required: false,
  },
  correo: {
    type: String,
    required: true,
    unique: true,
  },
  contraseña: {
    type: String,
    required: true,
  },
  user_rol: {
    type: String,
    enum: ["Pasajero", "Operador", "Administrador"],
    required: true,
  },
  estado: {
    type: Boolean,
    required: true,
  },
  tarjetas: [{
    type: Schema.Types.ObjectId,
    ref: tarjeta,
  }],
  fecha_creacion: {
    type: Date,
    default: Date.now,
  },
  last_login: {
    type: Date,
    required: false,
  },
  fecha_modificacion: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("contraseña")) {
    const document = this;
    // Verificar si la contraseña existe antes de hacer el hash
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

userSchema.methods.isCorrectPassword = function(userPassword, callback) {
  bcrypt.compare(userPassword, this.contraseña, function(error, same) {
      if (error) {
          callback(error);
      } else {
          callback(null, same);
      }
  });
};

const Usuario = model("Usuario", userSchema);
module.exports = Usuario;
