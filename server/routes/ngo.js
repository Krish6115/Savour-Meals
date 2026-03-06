const express = require('express');
const router = express.Router();
const {
  getRequests,
  assignVolunteer,
  getVolunteers
} = require('../controllers/ngoController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require NGO role
router.use(auth);
router.use(roleCheck('ngo'));

router.get('/requests', getRequests);
router.post('/assign/:donationId', assignVolunteer);
router.get('/volunteers', getVolunteers);

module.exports = router;

