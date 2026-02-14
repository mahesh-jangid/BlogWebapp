const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUser,
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(auth, roleCheck('admin'));

// User management routes
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
