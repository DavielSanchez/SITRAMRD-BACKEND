const express = require('express');
const router = express.Router();
const Actividad = require('../models/Actividad.js'); 

router.post('/add', async (req, res) => {
  try {
    const nuevaActividad = new Actividad(req.body);
    const actividadGuardada = await nuevaActividad.save();
    res.status(201).json({
      message: "Agregada con exito",
      data: actividadGuardada
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});


router.get('/all', async (req, res) => {
  try {
    const actividades = await Actividad.find().populate('idUsuario');
    res.status(200).json({
      message: "Usuarios:",
      count: actividades.length,
      data: actividades
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


router.get('/get/:id', async (req, res) => {
  try {
    const actividad = await Actividad.findById(req.params.id).populate('idUsuario');
    
    if (!actividad) {
      return res.status(404).json({
        message: 'Actividad no encontrada'
      });
    }
    
    res.status(200).json({
      data: actividad
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


router.put('/update/:id', async (req, res) => {
  try {
    const actividad = await Actividad.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!actividad) {
      return res.status(404).json({
        message: 'Actividad no encontrada'
      });
    }
    
    res.status(200).json({
      data: actividad
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});


router.delete('/delete/:id', async (req, res) => {
  try {
    const actividad = await Actividad.findByIdAndDelete(req.params.id);
    
    if (!actividad) {
      return res.status(404).json({
        message: 'Actividad no encontrada'
      });
    }
    
    res.status(200).json({
      data: {
        message: "Eliminado Con exito"
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


router.get('/usuario/:idUsuario', async (req, res) => {
  try {
    const actividades = await Actividad.find({ idUsuario: req.params.idUsuario });
    
    res.status(200).json({
      count: actividades.length,
      data: actividades
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;