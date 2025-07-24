const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/authMiddleware');
const {createKategoriProdukHukum,getKategoriProdukHukum, updateKategoriProdukHukum, deleteKategoriProdukHukum, createProdukHukum, getProdukHukum, updateProdukHukum, deleteProdukHukum, uploadProdukHukumFiles, getAllProdukHukum} = require('../../controllers/produkHukumController/produkHukum');

// Kategori Produk Hukum Routes
router.post('/createKategoriProdukHukum', authMiddleware, createKategoriProdukHukum); // Endpoint to create product law category
router.get('/getAllKategoriProdukHukum/:id', authMiddleware, getKategoriProdukHukum); // Endpoint to get all product law categories
router.put('/updateKategoriProdukHukum/:id', authMiddleware, updateKategoriProdukHukum); // Endpoint to update product law category
router.delete('/deleteKategoriProdukHukum/:id', authMiddleware, deleteKategoriProdukHukum); // Endpoint to delete product law category

// Produk Hukum Routes
router.post('/createProdukHukum', authMiddleware, uploadProdukHukumFiles, createProdukHukum); // Endpoint to create product law
router.get('/getAllProdukHukum', authMiddleware, getAllProdukHukum); // Endpoint to get all product laws
router.get('/getDetailProdukHukum/:id', authMiddleware, getProdukHukum); // Endpoint to get all product laws
router.put('/updateProdukHukum/:id', authMiddleware, uploadProdukHukumFiles, updateProdukHukum); // Endpoint to update product law
router.delete('/deleteProdukHukum/:id', authMiddleware, deleteProdukHukum); // Endpoint to delete product law

module.exports = router;