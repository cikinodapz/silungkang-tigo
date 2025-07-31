const express = require('express');
const { createAPBDes,getAllAPBDes, getAPBDes, updateAPBDes, deleteAPBDes } = require('../../controllers/APBDesController/apbd');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router();

router.post('/createAPBDes', authMiddleware, createAPBDes); // Endpoint to create APBDes
router.get('/getAllAPBDes', authMiddleware, getAllAPBDes); // Endpoint to get all APBDes
router.get('/getAPBDes/:id', authMiddleware, getAPBDes); // Endpoint to get APBDes by ID
router.put('/editAPBDes/:id', authMiddleware, updateAPBDes); // Endpoint to update APBDes by ID
router.delete('/deleteAPBDes/:id', authMiddleware, deleteAPBDes); // Endpoint to delete APBDes by ID

module.exports = router;