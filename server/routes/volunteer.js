const express = require('express');
const router = express.Router();
const {
  getTasks,
  updateTaskStatus,
  getHistory
} = require('../controllers/volunteerController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require Volunteer role
router.use(auth);
router.use(roleCheck('volunteer'));

router.get('/tasks', getTasks);
router.put('/task/:id', updateTaskStatus);
router.get('/history', getHistory);

module.exports = router;

