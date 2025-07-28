const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const {
  createUMKM,
  getUMKM,
  updateUMKM,
  deleteUMKM,
  createProduk,
  getAllProduk,
  getProduk,
  updateProduk,
  deleteProduk,
  uploadLapakDesaFiles,
  getAllUMKM,
} = require("../../controllers/lapakDesaController/lapakDesa");
const router = express.Router();

// UMKM Routes
router.post("/createUMKM", authMiddleware, uploadLapakDesaFiles, createUMKM);
router.get("/umkm", authMiddleware, getAllUMKM);
router.get("/umkm/:id", authMiddleware, getUMKM);
router.put("/umkm/:id", authMiddleware, uploadLapakDesaFiles, updateUMKM);
router.delete("/umkm/:id", authMiddleware, deleteUMKM);

// Produk Routes
router.post("/createProduk",authMiddleware, uploadLapakDesaFiles, createProduk);
router.get("/produk",authMiddleware, getAllProduk); // Endpoint to get all products
router.get("/produk/:id",authMiddleware, getProduk);
router.put("/produk/:id",authMiddleware, uploadLapakDesaFiles, updateProduk);
router.delete("/produk/:id",authMiddleware, deleteProduk);

module.exports = router;