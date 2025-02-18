const Autobus = require("../models/Autobus");

const socketHandler = (io) => {
    io.on("connection", (socket) => {
        console.log("Cliente conectado");

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

module.exports = socketHandler;
