const express = require("express");
const router = express.Router();
const { getVehicles, getVehicleLocation, addVehicle, updateVehicle, deleteVehicle } = require("../controllers/vehicleController");

router.get("/", getVehicles);
router.get("/location/:id", getVehicleLocation);
router.post("/add", addVehicle);
router.put("/update/:id", updateVehicle);
router.delete("/delete/:id", deleteVehicle);

module.exports = router;
