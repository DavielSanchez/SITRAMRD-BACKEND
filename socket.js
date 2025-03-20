const socketIo = require("socket.io");
const { Types } = require('mongoose');
const Mensaje = require("./models/Mensaje");
const Autobus = require("./models/Autobus");

module.exports = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: "*",

        }
    });

    io.on("connection", (socket) => {

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