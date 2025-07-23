const express = require('express');
const { createUser, getUsers,getUserById, updateUser, deleteUser } = require('../controllers/userController/kelolaUser');  
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/createUser',authMiddleware, createUser); // Endpoint to create a user
router.get('/getUser',authMiddleware, getUsers); // Endpoint to get all users  
router.get('/getUser/:id',authMiddleware, getUserById); // Endpoint to get a user by ID
router.put('/editUser/:id',authMiddleware, updateUser); // Endpoint to update a user by ID  
router.delete('/deleteUser/:id',authMiddleware, deleteUser); // Endpoint to delete a user by ID

module.exports = router;