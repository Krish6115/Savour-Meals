const express = require('express');
const router = express.Router();
const {
  createDonation,
  getPendingDonations,
  getDonorDonations,
  acceptDonation,
  rejectDonation,
  updateStatus
} = require('../controllers/foodController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Create donation (Donor only)
router.post('/create', auth, roleCheck('donor'), createDonation);

// Get pending donations (NGO only)
router.get('/pending', auth, roleCheck('ngo'), getPendingDonations);

// Get donor's donations (with or without donorId parameter)
router.get('/donor', auth, getDonorDonations);
router.get('/donor/:donorId', auth, getDonorDonations);

// Accept donation (NGO only)
router.put('/accept/:id', auth, roleCheck('ngo'), acceptDonation);

// Reject donation (NGO only)
router.put('/reject/:id', auth, roleCheck('ngo'), rejectDonation);

// Update status (NGO/Volunteer)
router.put('/status/:id', auth, roleCheck('ngo', 'volunteer'), updateStatus);

module.exports = router;

