const express = require("express");
const router = express.Router();
const Autobus = require("../models/Autobus");

// Listar vehículos
router.get("/", async (req, res) => {
    try {
        const vehiculos = await Autobus.find();
        res.json(vehiculos);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los vehículos" });
    }
});

// Obtener ubicación en tiempo real
router.get("/location/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const vehiculo = await Autobus.findById(id);

        if (!vehiculo) return res.status(404).json({ message: "Vehículo no encontrado" });

        res.json({
            id: vehiculo._id,
            ubicacionActual: vehiculo.ubicacionActual || { lat: null, lon: null }
        });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la ubicación" });
    }
});

// Registrar vehículo
router.post("/add", async (req, res) => {
    try {
        const { placa, modelo, capacidad } = req.body;

        const existente = await Autobus.findOne({ placa });
        if (existente) return res.status(400).json({ message: "Placa ya registrada" });

        const nuevoAutobus = new Autobus({ placa, modelo, capacidad, estado: "Inactivo" });
        await nuevoAutobus.save();

        res.status(201).json(nuevoAutobus);
    } catch (error) {
        res.status(500).json({ message: "Error al registrar el vehículo" });
    }
});

// Actualizar vehículo
router.put("/update/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { placa, modelo, capacidad, estado } = req.body;

        const vehiculo = await Autobus.findByIdAndUpdate(id, { placa, modelo, capacidad, estado }, { new: true });

        if (!vehiculo) return res.status(404).json({ message: "Vehículo no encontrado" });

        res.json(vehiculo);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el vehículo" });
    }
});

// Eliminar vehículo
router.delete("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const vehiculo = await Autobus.findById(id);

        if (!vehiculo) return res.status(404).json({ message: "Vehículo no encontrado" });
        if (vehiculo.idRuta) return res.status(400).json({ message: "No se puede eliminar un vehículo asignado a una ruta" });

        await Autobus.findByIdAndDelete(id);
        res.json({ message: "Vehículo eliminado" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el vehículo" });
    }
});

module.exports = router;
