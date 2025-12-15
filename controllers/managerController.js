const LeaveModel = require('../models/LeaveModel');
const TimeEntryModel = require('../models/TimeEntryModel');
const ProfitModel = require('../models/ProfitModel');
const UserModel = require('../models/UserModel');

// View pending leave requests
exports.viewLeaveRequests = async (req, res) => {
  try {
    const leaves = await LeaveModel.getPending();
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leave requests', error: err.message });
  }
};

// Approve leave request
exports.approveLeave = async (req, res) => {
  const leaveId = req.params.id;

  try {
    const leave = await LeaveModel.getById(leaveId);
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    const today = new Date().toISOString().split('T')[0];

    if (leave.start_date < today) {
      return res.status(400).json({
        message: 'Cannot approve leave after the start date has passed'
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        message: 'Leave request is already processed'
      });
    }

    await LeaveModel.updateStatus(leaveId, 'approved');
    res.json({ message: 'Leave approved' });

  } catch (err) {
    res.status(500).json({ message: 'Error approving leave', error: err.message });
  }
};


// Add monthly profit
exports.addProfit = async (req, res) => {
  const { month, year, profit } = req.body;
  try {
    await ProfitModel.create({ month, year, profit });
    res.json({ message: 'Profit added' });
  } catch (err) {
    res.status(500).json({ message: 'Error adding profit', error: err.message });
  }
};

// Get monthly profit
exports.getProfit = async (req, res) => {
  const { month, year } = req.params;
  try {
    const profit = await ProfitModel.getMonthly(parseInt(month), parseInt(year));
    res.json(profit);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profit', error: err.message });
  }
};

// Check for redundant workers
exports.checkRedundancy = async (req, res) => {
  const { month, year } = req.params;
  try {
    const users = await UserModel.getAll();
    const redundants = [];
    for (const user of users) {
      if (user.role === 'employee') {
        const hours = await TimeEntryModel.getMonthlyHours(user.id, parseInt(month), parseInt(year));
        // Assume minimum hours per month: 160 (40 hours/week * 4 weeks)
        if (hours < 160) {
          redundants.push({ id: user.id, name: user.name, hours });
        }
      }
    }
    res.json({ redundants });
  } catch (err) {
    res.status(500).json({ message: 'Error checking redundancy', error: err.message });
  }
};

// Annual summary
exports.annualSummary = async (req, res) => {
  const { year } = req.params;
  try {
    const profits = await ProfitModel.getYearly(parseInt(year));
    const totalProfit = await ProfitModel.getTotalYearly(parseInt(year));
    const users = await UserModel.getAll();
    const employeeSummaries = [];
    for (const user of users) {
      if (user.role === 'employee') {
        let totalHours = 0;
        let totalOffs = 0;
        for (let m = 1; m <= 12; m++) {
          totalHours += await TimeEntryModel.getMonthlyHours(user.id, m, parseInt(year));
          totalOffs += await LeaveModel.getMonthlyOffs(user.id, m, parseInt(year));
        }
        employeeSummaries.push({ id: user.id, name: user.name, totalHours, totalOffs });
      }
    }
    res.json({ profits, totalProfit, employeeSummaries });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching annual summary', error: err.message });
  }
};
