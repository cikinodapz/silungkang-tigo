const express = require('express');
const { getPopulationStats } = require('../../controllers/publicController/public');
const { getAllBerita, getAllKategoriBerita, getSampul, getBerita } = require('../../controllers/beritaControllers/berita');
const { getAllAPBDes } = require('../../controllers/APBDesController/apbd');
const { getAllPotensiDesa, getFotoPotensiDesa, getPotensiDesa } = require('../../controllers/potensiDesaController/potensiDesa');
const { getAllProdukHukum, getFileProdukHukum } = require('../../controllers/produkHukumController/produkHukum');
const { getAllUMKM, getFotoUMKM, getAllProduk, getFotoProduk, getUMKM } = require('../../controllers/lapakDesaController/lapakDesa');
const router = express.Router();

// Public Routes
router.get('/getPopulationStats', getPopulationStats);
router.get('/getAllBerita', getAllBerita); // Endpoint to get all news
router.get('/getAllAPBDes', getAllAPBDes); // Endpoint to get all APBDes

// Berita Routes
router.get('/getAllKategoriBerita', getAllKategoriBerita); // Endpoint to get all news categories
router.get('/getSampul/:type/:filename', getSampul); // Endpoint to view news cover image
router.get('/getBerita/:id', getBerita); // Endpoint to get all

//Potensi Desa Routes
router.get("/potensiDesa", getAllPotensiDesa);
router.get("/getPotensiDesa/:id", getPotensiDesa);
router.get("/foto-potensi-desa/:type/:filename", getFotoPotensiDesa); // Endpoint to view Potensi Desa photo

//Produk Hukum Routes
router.get('/getAllProdukHukum', getAllProdukHukum); // Endpoint to get all product laws
router.get('/getFileProdukHukum/:type/:filename', getFileProdukHukum); // Endpoint to view product law file

//Lapak Desa Routes
router.get("/umkm", getAllUMKM);
router.get("/umkm/:id", getUMKM);
router.get("/foto-umkm/:type/:filename", getFotoUMKM); // Endpoint to view UMKM photo
router.get("/foto-produk/:type/:filename", getFotoProduk); // Endpoint to view product photo

module.exports = router;