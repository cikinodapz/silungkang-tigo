const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const {
  createLahirMasuk,
  getLahirMasuk,
  updateLahirMasuk,
  deleteLahirMasuk,
  createMeninggal,
  getMeninggal,
  updateMeninggal,
  deleteMeninggal,
  createPindahKeluar,
  getPindahKeluar,
  updatePindahKeluar,
  deletePindahKeluar,
  getAllLahirMasuk,
  getAllMeninggal,
  getAllPindahKeluar,
} = require("../../controllers/mutasiController/mutasi");

const router = express.Router();

// Lahir Masuk Routes
router.post("/createLahirMasuk", authMiddleware, createLahirMasuk); // Endpoint to create birth/move in record
router.get("/getAllLahirMasuk", authMiddleware, getAllLahirMasuk); // Endpoint to get all birth/move in records
router.get("/getLahirMasuk/:id", authMiddleware, getLahirMasuk); // Endpoint to get birth/move in record by ID
router.put("/updateLahirMasuk/:id", authMiddleware, updateLahirMasuk); // Endpoint to update birth/move in record
router.delete("/deleteLahirMasuk/:id", authMiddleware, deleteLahirMasuk); // Endpoint to delete birth/move in record

// Meninggal Routes
router.post("/createMeninggal", authMiddleware, createMeninggal); // Endpoint to create death record
router.get("/getAllMeninggal", authMiddleware, getAllMeninggal); // Endpoint to get all death records
router.get("/getMeninggal/:id", authMiddleware, getMeninggal); //// Endpoint to get death record by ID
router.put("/updateMeninggal/:id", authMiddleware, updateMeninggal); // Endpoint to update death record
router.delete("/deleteMeninggal/:id", authMiddleware, deleteMeninggal); // Endpoint to delete death record

// Pindah Keluar Routes
router.post("/createPindahKeluar", authMiddleware, createPindahKeluar); // Endpoint to create move out record
router.get("/getAllPindahKeluar", authMiddleware, getAllPindahKeluar); // Endpoint to get all move out records
router.get("/getPindahKeluar/:id", authMiddleware, getPindahKeluar); // Endpoint to get move out record by ID
router.put("/updatePindahKeluar/:id", authMiddleware, updatePindahKeluar); // Endpoint to update move out record
router.delete("/deletePindahKeluar/:id", authMiddleware, deletePindahKeluar); // Endpoint to delete move out record

module.exports = router;