const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/authMiddleware');
const { createKepalaKeluarga,getFile, updateKepalaKeluarga, deleteKepalaKeluarga, getDetailKepalaKeluarga, createAnggotaKeluarga,getAnggotaKeluarga, updateAnggotaKeluarga,deleteAnggotaKeluarga } = require('../../controllers/pendudukController/dataKepalaKeluarga/dataKepalaKeluarga');
const { uploadKepalaKeluargaFiles } = require('../../middlewares/scanUpload');

//Kepala Keluarga Routes
router.post('/createKepalaKeluarga', uploadKepalaKeluargaFiles, createKepalaKeluarga); // Endpoint to create kepala keluarga
router.get('/getDetailKepalaKeluarga/:id', authMiddleware, getDetailKepalaKeluarga); // Endpoint to get kepala keluarga details
router.put('/editKepalaKeluarga/:id', uploadKepalaKeluargaFiles, updateKepalaKeluarga); // Endpoint to update kepala keluarga
router.delete('/deleteKepalaKeluarga/:id', authMiddleware, deleteKepalaKeluarga); // Endpoint to delete kepala keluarga
router.get('/getScan/:type/:filename', authMiddleware, getFile); // Endpoint to update kepala keluarga

// Anggota Keluarga Routes
router.post('/createAnggotaKeluarga', uploadKepalaKeluargaFiles, createAnggotaKeluarga); // Endpoint to create anggota keluarga
router.get('/getAnggotaKeluarga/:id', authMiddleware, getAnggotaKeluarga); // Endpoint to get anggota keluarga by kepala keluarga ID
router.put('/editAnggotaKeluarga/:id', uploadKepalaKeluargaFiles, updateAnggotaKeluarga); // Endpoint to update anggota keluarga
router.delete('/deleteAnggotaKeluarga/:id', authMiddleware, deleteAnggotaKeluarga); // Endpoint to delete anggota keluarga

module.exports = router;
