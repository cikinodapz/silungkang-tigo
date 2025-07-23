const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/authMiddleware');
const { createKK, getAllKK, getKKById, updateKK, deleteKK } = require('../../controllers/pendudukController/dataKK/dataKK');

router.post('/createKK', authMiddleware, createKK);
router.get('/getAllKK', authMiddleware, getAllKK);
router.get('/getKKbyId/:id', authMiddleware, getKKById);
router.put('/editKK/:id', authMiddleware, updateKK);
router.delete('/deleteKK/:id', authMiddleware, deleteKK);

module.exports = router;