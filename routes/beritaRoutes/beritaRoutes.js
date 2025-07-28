const express = require('express');
const { createKategoriBerita, updateKategoriBerita, deleteKategoriBerita, createBerita,getBerita,updateBerita,deleteBerita,uploadBeritaFiles, getAllKategoriBerita, getAllBerita, getSampul } = require('../../controllers/beritaControllers/berita');
const authMiddleware = require('../../middlewares/authMiddleware');
const router = express.Router();

// Kategori Berita Routes
router.post('/createKategoriBerita', authMiddleware, createKategoriBerita); // Endpoint to create news category
router.get('/getAllKategoriBerita', authMiddleware, getAllKategoriBerita); // Endpoint to get all news categories
router.put('/updateKategoriBerita/:id', authMiddleware, updateKategoriBerita); // Endpoint to update news category
router.delete('/deleteKategoriBerita/:id', authMiddleware, deleteKategoriBerita); // Endpoint to delete news category

// Berita Routes
router.post('/createBerita', authMiddleware, uploadBeritaFiles, createBerita); // Endpoint to create news
router.get('/getAllBerita', authMiddleware, getAllBerita); // Endpoint to get all news
router.get('/getBerita', authMiddleware, getBerita); // Endpoint to get all
router.put('/updateBerita/:id', authMiddleware, uploadBeritaFiles, updateBerita); // Endpoint to update news
router.delete('/deleteBerita/:id', authMiddleware, deleteBerita); // Endpoint to
router.get('/getSampul/:type/:filename', authMiddleware, getSampul); // Endpoint to view news cover image


module.exports = router;