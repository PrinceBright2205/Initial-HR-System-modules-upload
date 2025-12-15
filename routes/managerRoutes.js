const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { approveLeave, viewLeaveRequests, addProfit, getProfit, checkRedundancy, annualSummary } = require('../controllers/managerController');

// GET /api/manager/leave/requests
router.get('/leave/requests', auth, viewLeaveRequests);

// POST /api/manager/leave/approve/:id
router.post('/leave/approve/:id', auth, approveLeave);

// POST /api/manager/profit
router.post('/profit', auth, addProfit);

// GET /api/manager/profit/:month/:year
router.get('/profit/:month/:year', auth, getProfit);

// GET /api/manager/redundancy/:month/:year
router.get('/redundancy/:month/:year', auth, checkRedundancy);

// GET /api/manager/summary/:year
router.get('/summary/:year', auth, annualSummary);

module.exports = router;
