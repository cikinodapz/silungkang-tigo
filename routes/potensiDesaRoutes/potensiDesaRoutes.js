const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const {
  createPotensiDesa,
  getAllPotensiDesa,
  getPotensiDesa,
  updatePotensiDesa,
  deletePotensiDesa,
  getFotoPotensiDesa,
  uploadPotensiDesaFiles
} = require("../../controllers/potensiDesaController/potensiDesa");
const router = express.Router();

// Potensi Desa Routes
router.post("/createPotensiDesa", authMiddleware, uploadPotensiDesaFiles, createPotensiDesa);
router.get("/potensiDesa", authMiddleware, getAllPotensiDesa);
router.get("/getPotensiDesa/:id", authMiddleware, getPotensiDesa);
router.put("/updatePotensiDesa/:id", authMiddleware, uploadPotensiDesaFiles, updatePotensiDesa);
router.delete("/deletePotensiDesa/:id", authMiddleware, deletePotensiDesa);
router.get("/foto-potensi-desa/:type/:filename", authMiddleware, getFotoPotensiDesa); // Endpoint to view Potensi Desa photo

module.exports = router;