module.exports = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("Nuevo cliente conectado");

        // 🔹 Manejo de mensajes
        socket.on("nuevo-mensaje", async (mensajeData) => {
            try {
                const nuevoMensaje = new Mensaje(mensajeData);
                await nuevoMensaje.save();

                io.emit("mensaje-recibido", nuevoMensaje);
            } catch (error) {
                console.error("Error al guardar el mensaje:", error);
            }
        });

        // 🔹 Manejo de actualización de ubicación
        socket.on("updateLocation", async ({ id, lat, lon }) => {
            try {
                const vehiculo = await Autobus.findByIdAndUpdate(id, { ubicacionActual: { lat, lon } }, { new: true });

                if (vehiculo) {
                    io.emit("locationUpdated", { id, ubicacionActual: vehiculo.ubicacionActual });
                }
            } catch (error) {
                console.error("Error actualizando ubicación:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log("Cliente desconectado");
        });
    });
};