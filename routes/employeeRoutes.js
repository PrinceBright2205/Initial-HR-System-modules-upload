const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { applyLeave, getInventoryList, checkIn, startBreak, endBreak, checkOut, getMonthlyReport } = require('../controllers/employeeController');

// POST /api/employee/leave/apply
router.post('/leave/apply', auth, applyLeave);

// GET /api/employee/inventory
router.get('/inventory', auth, getInventoryList);

// Time tracking
router.post('/time/checkin', auth, checkIn);
router.post('/time/break/start', auth, startBreak);
router.post('/time/break/end', auth, endBreak);
router.post('/time/checkout', auth, checkOut);

// GET /api/employee/report/:month/:year
router.get('/report/:month/:year', auth, getMonthlyReport);

module.exports = router;
