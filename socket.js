const socketIo = require("socket.io");
const Mensaje = require("./models/Mensaje");

module.exports = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    })

    io.on("connection", (socket) => {
        console.log("Nuevo cliente conectado");

        socket.on("nuevo-mensaje", async(mensajeData) => {
            try {
                const nuevoMensaje = new Mensaje(mensajeData);
                await nuevoMensaje.save();

                io.emit("mensaje-recibido", nuevoMensaje);
            } catch (error) {
                console.error("Error al guardar el mensaje", error);
            }
        });

        socket.on("disconnect", () => {
            console.log("Cliente desconectado");
        });

    })
}