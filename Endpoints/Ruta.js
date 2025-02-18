const express = require("express");
const router = express.Router();
const RutaSchema = require("../models/Ruta");
const AutoBus = require("../models/Autobus");
const verificarRol = require("../middleware/verificarRol");

// CRUD de rutas
router.post("/add", verificarRol(["Administrador"]), async (req, res) => {
  const { nombreRuta, paradas, coordenadas } = req.body;
  const ruta = new RutaSchema({
    nombreRuta,
    paradas,
    coordenadas,
    fechaCreacion: Date.now(),
  });

  try {
    await ruta.save();
    res.status(201).json({ message: "Ruta agregada con éxito", ruta });
  } catch (error) {
    res.status(500).json({ message: "Error al agregar la ruta", error });
  }
});

router.post("/all", verificarRol(["Administrador"]), async (req, res) => {
  try {
    const everyRoute = await RutaSchema.find();
    if (everyRoute.length === 0) {
      return res.status(204).json({ message: "No hay ningún contenido para rutas" });
    }
    res.status(200).json(everyRoute);
  } catch (error) {
    res.status(500).json({ message: "Hubo un error en el servidor", error });
  }
});

router.get("/get/:id", verificarRol(["Administrador"]), async (req, res) => {
    try {
      const id = req.params.id;
      const RouteId = await RutaSchema.findById(id);

      if (!RouteId) {
        return res.status(404).json({ message: "La Id proporcionada es inexistente" });
      }
      res.status(200).json({ message: "Ruta encontrada", route: RouteId });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
  });
  

router.put("/update/:id", verificarRol(["Administrador"]), async (req, res) => {
  try {
    const routeId = req.params.id;
    const { nombreRuta, paradas, coordenadas } = req.body;

    const selectedRoute = await RutaSchema.findById(routeId);
    if (!selectedRoute) {
      return res.status(404).json({ message: "Ruta no encontrada" });
    }

    const fieldsToUpdate = { nombreRuta, paradas, coordenadas };
    const newValues = {};

    Object.entries(fieldsToUpdate).forEach(([key, value]) => {
      if (value !== undefined) {
        newValues[key] = value;
      }
    });

    if (Object.keys(newValues).length === 0) {
      return res.status(400).json({ message: "No se proporcionaron valores para actualizar" });
    }

    const updatedRoute = await RutaSchema.findByIdAndUpdate(routeId, newValues, { new: true });
    res.status(200).json({
      message: "Ruta actualizada con éxito",
      updatedRoute,
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
});

router.delete("/delete/:id", verificarRol(["Administrador"]), async (req, res) => {
  try {
    const id = req.params.id;

    const deletedRoute = await RutaSchema.findByIdAndDelete(id);

    if (!deletedRoute) {
      return res.status(404).json({ message: `Ruta con ID ${id} no encontrada` });
    }

    res.status(200).json({ message: "Ruta eliminada con éxito", deletedRoute });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
});


//Funcionalidades Operador

router.post("/asignar", verificarRol(["Operador", "Administrador"]), async (req, res) => {
  try {
    const { rutaId, autobusId } = req.body;

    const ruta = await RutaSchema.findById(rutaId);
    if (!ruta) {
      return res.status(404).json({ message: "Ruta no encontrada" });
    }

    const autoBus = await AutoBus.findById(autobusId);
    if (!autoBus) {
      return res.status(404).json({ message: "Autobus inexistente" });
    }

    if (autoBus.idRuta) {
      return res.status(400).json({ message: "Este autobús ya está asignado a una ruta" });
    }

    autoBus.idRuta = rutaId;
    await autoBus.save();

    res.status(200).json({
      message: "Autobús asignado a la ruta correctamente",
      ruta,
      autoBus,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error en el servidor", error: err });
  }
});


router.put("/modificar", verificarRol(["Operador", "Administrador"]), async (req, res) => {
    try {
      const { rutaId, autobusId } = req.body;
  
      const ruta = await RutaSchema.findById(rutaId);
      if (!ruta) {
        return res.status(404).json({ message: "Ruta no encontrada" });
      }
  
      const autoBus = await AutoBus.findById(autobusId);
      if (!autoBus) {
        return res.status(404).json({ message: "Autobús no encontrado" });
      }
  
      if (autoBus.idRuta && autoBus.idRuta.toString() === rutaId) {
        return res.status(400).json({ message: "Este autobús ya está asignado a esta ruta" });
      }
  
      autoBus.idRuta = rutaId;
      await autoBus.save();
  
      res.status(200).json({
        message: "Autobús re-asignado a la nueva ruta con éxito",
        autoBus,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error en el servidor", error: err });
    }
  });  

module.exports = router;
