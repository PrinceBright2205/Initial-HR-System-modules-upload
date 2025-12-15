const LeaveModel = require('../models/LeaveModel');
const InventoryModel = require('../models/InventoryModel');
const TimeEntryModel = require('../models/TimeEntryModel');
const UserModel = require('../models/UserModel');

// Apply for leave
exports.applyLeave = async (req, res) => {
  const { leave_type, start_date, end_date } = req.body;
  const user_id = req.user.id;

  // Calculate days requested
  const start = new Date(start_date);
  const end = new Date(end_date);
  const days_requested = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  // Check monthly offs
  const month = start.getMonth() + 1;
  const year = start.getFullYear();
  const monthlyOffs = await LeaveModel.getMonthlyOffs(user_id, month, year);

  // South African law: Annual leave 21 days/year, sick leave 30 days/year
  // Allowed skips per month: assuming 2 days max unauthorized absence per month
  const maxSkipsPerMonth = 2;
  const user = await UserModel.findById(user_id);
  let allowed = true;
  let reason = '';

  if (leave_type === 'annual' && user.annual_leave_balance < days_requested) {
    allowed = false;
    reason = 'Insufficient annual leave balance';
  } else if (leave_type === 'sick' && user.sick_leave_balance < days_requested) {
    allowed = false;
    reason = 'Insufficient sick leave balance';
  } else if (monthlyOffs + days_requested > maxSkipsPerMonth) {
    allowed = false;
    reason = `Exceeds monthly off limit of ${maxSkipsPerMonth} days`;
  }

  if (!allowed) {
    return res.status(400).json({ message: reason });
  }

  try {
    await LeaveModel.create({ user_id, leave_type, start_date, end_date, days_requested });
    res.json({ message: 'Leave request submitted' });
  } catch (err) {
    res.status(500).json({ message: 'Error applying for leave', error: err.message });
  }
};

// Get inventory list
exports.getInventoryList = async (req, res) => {
  try {
    const inventory = await InventoryModel.getAll();
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching inventory', error: err.message });
  }
};

// Time tracking
exports.checkIn = async (req, res) => {
  const user_id = req.user.id;
  const date = new Date().toISOString().split('T')[0];
  const check_in = new Date().toISOString();

  try {
    let entry = await TimeEntryModel.getTodayEntry(user_id, date);
    if (entry) {
      return res.status(400).json({ message: 'Already checked in today' });
    }
    await TimeEntryModel.create({ user_id, date, check_in });
    res.json({ message: 'Checked in successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error checking in', error: err.message });
  }
};

exports.startBreak = async (req, res) => {
  const user_id = req.user.id;
  const date = new Date().toISOString().split('T')[0];
  const break_start = new Date().toISOString();

  try {
    let entry = await TimeEntryModel.getTodayEntry(user_id, date);
    if (!entry || entry.check_out) {
      return res.status(400).json({ message: 'Invalid break start' });
    }
    await TimeEntryModel.updateEntry(entry.id, { break_start });
    res.json({ message: 'Break started' });
  } catch (err) {
    res.status(500).json({ message: 'Error starting break', error: err.message });
  }
};

exports.endBreak = async (req, res) => {
  const user_id = req.user.id;
  const date = new Date().toISOString().split('T')[0];
  const break_end = new Date().toISOString();

  try {
    let entry = await TimeEntryModel.getTodayEntry(user_id, date);
    if (!entry || !entry.break_start) {
      return res.status(400).json({ message: 'Invalid break end' });
    }
    await TimeEntryModel.updateEntry(entry.id, { break_end });
    res.json({ message: 'Break ended' });
  } catch (err) {
    res.status(500).json({ message: 'Error ending break', error: err.message });
  }
};

exports.checkOut = async (req, res) => {
  const user_id = req.user.id;
  const date = new Date().toISOString().split('T')[0];
  const check_out = new Date().toISOString();

  try {
    let entry = await TimeEntryModel.getTodayEntry(user_id, date);
    if (!entry || entry.check_out) {
      return res.status(400).json({ message: 'Already checked out or not checked in' });
    }
    let total_hours = 0;
    if (entry.check_in) {
      const checkInTime = new Date(entry.check_in);
      const checkOutTime = new Date(check_out);
      total_hours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
      if (entry.break_start && entry.break_end) {
        const breakDuration = (new Date(entry.break_end) - new Date(entry.break_start)) / (1000 * 60 * 60);
        total_hours -= breakDuration;
      }
    }
    await TimeEntryModel.updateEntry(entry.id, { check_out, total_hours });
    res.json({ message: 'Checked out successfully', total_hours });
  } catch (err) {
    res.status(500).json({ message: 'Error checking out', error: err.message });
  }
};

exports.getMonthlyReport = async (req, res) => {
  const user_id = req.user.id;
  const { month, year } = req.params;
  try {
    const hours = await TimeEntryModel.getMonthlyHours(user_id, parseInt(month), parseInt(year));
    const offs = await LeaveModel.getMonthlyOffs(user_id, parseInt(month), parseInt(year));
    res.json({ hours, offs });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching report', error: err.message });
  }
};
