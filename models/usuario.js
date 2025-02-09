const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

const User = new Schema({
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
  fecha_creacion: {
    type: Date,
    default: Date.now
  },
  last_login: {
    type: Date,
    required: false,
  },
  fecha_modificacion: {
    type: Date,
    default: Date.now
  },
});

User.pre("save", async function (next) {
    if (!this.isModified("contraseña")) return next();
    const salt = await bcrypt.genSalt();
    this.contraseña = await bcrypt.hash(this.contraseña, salt);
    next();
  });
  
  User.methods.passVerify = async function (password) {
    return bcrypt.compare(password, this.contraseña);
  };
  
  const Usuario = model("Usuario", User);
  module.exports = Usuario;