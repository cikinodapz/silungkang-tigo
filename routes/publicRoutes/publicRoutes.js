const express = require('express');
const { getPopulationStats } = require('../../controllers/publicController/public');
const { getAllBerita, getAllKategoriBerita, getSampul, getBerita } = require('../../controllers/beritaControllers/berita');
const { getAllAPBDes } = require('../../controllers/APBDesController/apbd');
const router = express.Router();

// Public Routes
router.get('/getPopulationStats', getPopulationStats);
router.get('/getAllBerita', getAllBerita); // Endpoint to get all news
router.get('/getAllAPBDes', getAllAPBDes); // Endpoint to get all APBDes

// Berita Routes
router.get('/getAllKategoriBerita', getAllKategoriBerita); // Endpoint to get all news categories
router.get('/getSampul/:type/:filename', getSampul); // Endpoint to view news cover image
router.get('/getBerita/:id', getBerita); // Endpoint to get all

module.exports = router;