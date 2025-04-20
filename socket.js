const socketIo = require("socket.io");
const { Types } = require('mongoose');
const Mensaje = require("./models/Mensaje");
const Autobus = require("./models/Autobus");
const Usuario = require('./models/Usuario')
const Alerta = require("./models/Alertas")

module.exports = (server) => {
    const io = require("socket.io")(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {

        console.log("🔌 Nuevo cliente conectado:", socket.id);

        socket.on("join-alert-room", async({ userId }) => {

            if (!Types.ObjectId.isValid(userId)) {
                console.warn("❗ ID de usuario no válido:", userId);
                return;
            }
            if (Types.ObjectId.isValid(userId)) {
                socket.join(userId);
                console.log("🔍 Salas actuales del socket:", socket.rooms);
                console.log(`✅ Usuario ${userId} unido a su sala`);

                // También podrías unirlo a su rol o ruta si lo necesitas
                const user = await Usuario.findById(userId);

                if (user?.userRol) {
                    const rolRoom = user.userRol.toLowerCase(); // 👈 normaliza
                    socket.join(rolRoom);
                    console.log(`🔹 Usuario ${userId} unido a rol: ${rolRoom}`);
                }

                if (user?.rutasAsignadas?.length > 0) {
                    user.rutasAsignadas.forEach(rutaId => {
                        socket.join(`ruta_${rutaId.toString()}`);
                        console.log("🔍 Salas actuales del socket:", socket.rooms);
                        console.log(`🚌 Usuario ${userId} unido a ruta: ruta_${rutaId}`);
                    });
                }
            }
        });

        // socket.on("nueva-alerta", async(alertaData) => {
        //     try {
        //         const { titulo, descripcion, tipo, color, tipo_destinatario, ruta_id, userId, destinatarios: bodyDestinatarios } = alertaData;

        //         let destinatarios = [];
        //         console.log('Destinatarios iniciales: ' + tipo_destinatario)

        //         if (tipo_destinatario === "todos") {
        //             destinatarios = await Usuario.find().select("_id");
        //         }else if (tipo_destinatario === "operadores"){
        //             destinatarios = await Usuario.find({ userRol: 'Operador'}).select("_id");
        //             console.log(destinatarios)
        //         }else if (tipo_destinatario === "conductores"){
        //             destinatarios = await Usuario.find({ userRol: 'Conductor'}).select("_id");
        //             console.log(destinatarios)
        //         }else if (tipo_destinatario === "administradores"){
        //             destinatarios = await Usuario.find({ userRol: 'Administrador'}).select("_id");
        //             console.log(destinatarios)
        //         } else if (tipo_destinatario === "conductores_ruta") {
        //             if (!ruta_id) return;
        //             destinatarios = await Usuario.find({ userRol: "Conductor", rutasAsignadas: ruta_id }).select("_id");
        //         }else if (tipo_destinatario === "usuarios_ruta") {
        //             if (!ruta_id) return;
        //             destinatarios = await Usuario.find({ rutasAsignadas: ruta_id }).select("_id");
        //         } else if (tipo_destinatario === "usuario") {
        //             if (!bodyDestinatarios || !Array.isArray(bodyDestinatarios)) return;
        //             destinatarios = bodyDestinatarios;
        //         }

        //         const alerta = new Alerta({
        //             titulo,
        //             descripcion,
        //             tipo,
        //             color,
        //             creador_id: userId,
        //             destinatarios: destinatarios.map(d => d._id ? d._id : d),
        //             tipo_destinatario,
        //             ruta_id: ruta_id || null
        //         });

        //         await alerta.save();
        //         console.log('Nueva Alerta: ' + alerta)

        //         // Emitir a los destinatarios
        //         if (tipo_destinatario === "todos") {
        //             io.emit("alerta-recibida", alerta);
        //         } else {
        //             destinatarios.forEach(user => {
        //                 const userId = user._id ? user._id.toString() : user.toString();
        //                 // io.to(userId).emit("alerta-recibida", alerta);
        //                 io.emit("alerta-recibida", alerta);
        //             });
        //         }

        //     } catch (error) {
        //         console.error("Error al emitir alerta:", error);
        //     }
        // });

        socket.on("nueva-alerta", async (alertaData) => {
            try {
                const {
                    titulo,
                    descripcion,
                    tipo,
                    color,
                    tipo_destinatario,
                    destinatarios: bodyDestinatarios,
                    ruta_id,
                    userId
                } = alertaData;


                let destinatarios = [];
                console.log('Destinatarios iniciales: ' + tipo_destinatario)

                if (tipo_destinatario === "todos") {
                    destinatarios = await Usuario.find().select("_id");
                }else if (tipo_destinatario === "operadores"){
                    destinatarios = await Usuario.find({ userRol: 'Operador'}).select("_id");
                    console.log(destinatarios)
                }else if (tipo_destinatario === "conductores"){
                    destinatarios = await Usuario.find({ userRol: 'Conductor'}).select("_id");
                    console.log(destinatarios)
                }else if (tipo_destinatario === "administradores"){
                    destinatarios = await Usuario.find({ userRol: 'Administrador'}).select("_id");
                    console.log(destinatarios)
                } else if (tipo_destinatario === "conductores_ruta") {
                    if (!ruta_id) return;
                    destinatarios = await Usuario.find({ userRol: "Conductor", rutasAsignadas: ruta_id }).select("_id");
                }else if (tipo_destinatario === "usuarios_ruta") {
                    if (!ruta_id) return;
                    destinatarios = await Usuario.find({ rutasAsignadas: ruta_id }).select("_id");
                } else if (tipo_destinatario === "usuario") {
                    if (!bodyDestinatarios || !Array.isArray(bodyDestinatarios)) return;
                    destinatarios = bodyDestinatarios;
                }
        
                const nuevaAlerta = new Alerta({
                    titulo,
                    descripcion,
                    tipo,
                    color,
                    tipo_destinatario,
                    destinatarios: destinatarios.map(d => d._id ? d._id : d),
                    ruta_id: ruta_id || null,
                    estado: "activa",
                    leidaPor: [],
                    fecha_creacion: new Date(),
                });
        
                console.log("🧑‍🤝‍🧑 Destinatarios finales:", destinatarios.map(d => d._id || d));
                await nuevaAlerta.save();
                console.log("🆕 Nueva Alerta Guardada:", nuevaAlerta);
        
                // Notificar según el tipo de destinatario
                switch (tipo_destinatario) {
                    case 'todos':
                        console.log("➡️ Todos los usuarios conectados");
                        io.emit("alerta-recibida", nuevaAlerta);
                        break;
        
                        case 'operadores':
                            console.log(`➡️ Usuarios en la sala operador`);
                            io.to("operador").emit("alerta-recibida", nuevaAlerta);
                            break;
                    case 'conductores':
                        console.log(`➡️ Usuarios en la sala Conductor`);
                        io.to("conductor").emit("alerta-recibida", nuevaAlerta);
                        break;
                    case 'administradores':
                        console.log(`➡️ Usuarios en la sala Administrador`);
                        io.to("administrador").emit("alerta-recibida", nuevaAlerta);
                        break;
        
                    case 'usuario':
                        destinatarios.forEach(d => {
                            const id = d._id ? d._id.toString() : d.toString();
                            io.to(id).emit("alerta-recibida", nuevaAlerta);
                        });
                        break;
        
                    case 'usuarios_ruta':
                    case 'conductores_ruta':
                        if (ruta_id) {
                            console.log(`➡️ Usuarios en sala ruta_${ruta_id}`);
                            io.to(`ruta_${ruta_id.toString()}`).emit("alerta-recibida", nuevaAlerta);
                        }
                        break;
        
                    default:
                        console.warn("⚠️ Tipo de destinatario desconocido:", tipo_destinatario);
                }
            } catch (error) {
                console.error("❌ Error al procesar alerta:", error);
            }
        });
        

        socket.on("getNoLeidasCount", async ({ userId }) => {
            const alertas = await Alerta.find({
              destinatarios: userId,
              leidaPor: { $ne: userId }
            });
            console.log("No leidas: " + alertas.length)
            socket.emit("noLeidasCount", alertas.length);
          });

        socket.on("alerta-leida", async({ alertaId, userId }) => {
            try {
                const alerta = await Alerta.findByIdAndUpdate(alertaId, {
                    $addToSet: { leidaPor: userId }
                }, { new: true });

                if (alerta) {
                    console.log(`✅ Usuario ${userId} marcó alerta ${alertaId} como leída`);
                    io.to(userId).emit("alerta-actualizada", alerta);
                    io.to(userId).emit("actualizar-badge");
                }
            } catch (err) {
                console.error("Error al marcar alerta como leída:", err);
            }
        });


        // 🔹 Manejo de mensajes
        socket.on("nuevo-mensaje", async(mensajeData) => {
            try {
                const nuevoMensaje = new Mensaje(mensajeData);
                await nuevoMensaje.save();

                io.emit("mensaje-recibido", nuevoMensaje);
            } catch (error) {
                console.error("Error al guardar el mensaje:", error);
            }
        });

        socket.on("marcar-como-leido", async({ mensajeId, usuarioId }) => {
            try {
                if (!Types.ObjectId.isValid(mensajeId) || !Types.ObjectId.isValid(usuarioId)) {
                    return res.status(400).json({ error: 'Ids no válidos' });
                }

                const mensajeActualizado = await Mensaje.findOneAndUpdate({
                    _id: mensajeId,
                    'leidoPor.userId': usuarioId
                }, {
                    $set: {
                        'leidoPor.$.leido': true
                    }
                }, { new: true });

                io.emit("marcar-como-leido", mensajeActualizado); // Emitir el mensaje actualizado a todos los clientes
            } catch (error) {
                console.error('Error al marcar como leído:', error);
            }
        });

        // 🔹 Manejo de actualización de ubicación
        socket.on("updateLocation", async({ id, lat, lon }) => {
            try {
                const vehiculo = await Autobus.findByIdAndUpdate(id, { ubicacionActual: { lat, lon } }, { new: true });

                if (vehiculo) {
                    io.emit("locationUpdated", { id, ubicacionActual: vehiculo.ubicacionActual });
                }
            } catch (error) {
                console.error("Error actualizando ubicación:", error);
            }
        });

        socket.on("disconnect", () => {});
    });
};