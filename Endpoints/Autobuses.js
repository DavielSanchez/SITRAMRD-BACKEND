const express = require("express");
const router = express.Router();
const Autobus = require("../models/Autobus");

<<<<<<< HEAD
=======
/**
 * @swagger
 * tags:
 *   - name: Vehículos | Autobuses
 *     description: Endpoints para la gestión de autobuses en la plataforma.
 */

>>>>>>> develop
// Listar vehículos
router.get("/", async (req, res) => {
    try {
        const vehiculos = await Autobus.find();
        res.json(vehiculos);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los vehículos" });
    }
});

<<<<<<< HEAD
=======
/**
 * @swagger
 * /vehicles:
 *   get:
 *     summary: Listar todos los vehículos
 *     description: Retorna un listado de todos los autobuses registrados en la plataforma.
 *     tags: [Vehículos | Autobuses]
 *     responses:
 *       200:
 *         description: Lista de autobuses obtenida con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   placa:
 *                     type: string
 *                   modelo:
 *                     type: string
 *                   capacidad:
 *                     type: integer
 *                   estado:
 *                     type: string
 *       500:
 *         description: Error al obtener los vehículos.
 */

>>>>>>> develop
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

<<<<<<< HEAD
=======
/**
 * @swagger
 * /vehicles/location/{id}:
 *   get:
 *     summary: Obtener ubicación en tiempo real de un vehículo
 *     description: Retorna la ubicación actual de un autobús según su ID.
 *     tags: [Vehículos | Autobuses]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID del vehículo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ubicación del vehículo obtenida con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 ubicacionActual:
 *                   type: object
 *                   properties:
 *                     lat:
 *                       type: number
 *                     lon:
 *                       type: number
 *       404:
 *         description: Vehículo no encontrado.
 *       500:
 *         description: Error en el servidor.
 */


>>>>>>> develop
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

<<<<<<< HEAD
=======
/**
 * @swagger
 * /vehicles/add:
 *   post:
 *     summary: Registrar un nuevo vehículo
 *     description: Permite registrar un nuevo autobús en la plataforma.
 *     tags: [Vehículos | Autobuses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               placa:
 *                 type: string
 *               modelo:
 *                 type: string
 *               capacidad:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Vehículo registrado exitosamente.
 *       400:
 *         description: Placa ya registrada.
 *       500:
 *         description: Error en el servidor.
 */

>>>>>>> develop
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

<<<<<<< HEAD
=======
/**
 * @swagger
 * /autobus/update/{id}:
 *   put:
 *     summary: Actualizar información de un vehículo
 *     description: Permite modificar los datos de un autobús ya registrado.
 *     tags: [Vehículos | Autobuses]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID del vehículo a actualizar
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               placa:
 *                 type: string
 *               modelo:
 *                 type: string
 *               capacidad:
 *                 type: integer
 *               estado:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vehículo actualizado exitosamente.
 *       404:
 *         description: Vehículo no encontrado.
 *       500:
 *         description: Error en el servidor.
 */


>>>>>>> develop
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

<<<<<<< HEAD
module.exports = router;
=======
/**
 * @swagger
 * /vehicles/delete/{id}:
 *   delete:
 *     summary: Eliminar un vehículo
 *     description: Permite eliminar un autobús de la base de datos si no está asignado a una ruta.
 *     tags: [Vehículos | Autobuses]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID del vehículo a eliminar
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vehículo eliminado exitosamente.
 *       400:
 *         description: No se puede eliminar un vehículo asignado a una ruta.
 *       404:
 *         description: Vehículo no encontrado.
 *       500:
 *         description: Error en el servidor.
 */

module.exports = router;

>>>>>>> develop
