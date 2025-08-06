const express = require('express');
const { getPopulationStats } = require('../../controllers/publicController/public');
const { getAllBerita } = require('../../controllers/beritaControllers/berita');
const { getAllAPBDes } = require('../../controllers/APBDesController/apbd');
const router = express.Router();

// Public Routes
router.get('/getPopulationStats', getPopulationStats);
router.get('/getAllBerita', getAllBerita); // Endpoint to get all news
router.get('/getAllAPBDes', getAllAPBDes); // Endpoint to get all APBDes



module.exports = router;