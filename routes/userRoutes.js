const express = require('express');
const {
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  getAllUsers,
  updateUserRole
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All user routes require authentication
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/addresses', addAddress);
router.put('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);

// Admin only routes
router.get('/', authorize('admin'), getAllUsers);
router.put('/:id/role', authorize('admin'), updateUserRole);

module.exports = router;

