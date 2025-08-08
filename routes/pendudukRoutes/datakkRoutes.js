const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/authMiddleware');
const { createKK, getAllKK, getKKById, updateKK, deleteKK,getDashboardSummary, getKKWithoutKepalaKeluarga, trackVisitor, getVisitorStats } = require('../../controllers/pendudukController/dataKK/dataKK');
const { route } = require('..');

router.post('/createKK', authMiddleware, createKK);
router.get('/getKKWithoutKepalaKeluarga', authMiddleware, getKKWithoutKepalaKeluarga); // Endpoint to get KK without kepala keluarga
router.get('/getAllKK', authMiddleware, getAllKK);
router.get('/getKKbyId/:id', authMiddleware, getKKById);
router.put('/editKK/:id', authMiddleware, updateKK);
router.delete('/deleteKK/:id', authMiddleware, deleteKK);

//dashbboard
router.get('/getDashboardSummary', authMiddleware, getDashboardSummary); // Endpoint to get dashboard summary

// Stats and Visitor Tracking
router.get('/track', trackVisitor);
router.get('/stats', getVisitorStats);

module.exports = router;