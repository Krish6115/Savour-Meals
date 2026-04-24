const express = require('express');
const router = express.Router();
const {
  getUsers,
  updateUser,
  deleteUser,
  getDonations,
  getAnalytics
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require Admin role
router.use(auth);
router.use(roleCheck('admin'));

router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/donations', getDonations);
router.get('/analytics', getAnalytics);

module.exports = router;
