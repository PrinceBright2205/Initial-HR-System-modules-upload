const db = require('../config/db');
const UserModel = require('./UserModel');

class LeaveModel {
    static async create(leave) {
        const { user_id, leave_type, start_date, end_date, days_requested } = leave;
        const sql = `INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, status, days_requested) VALUES (?, ?, ?, ?, 'pending', ?)`;
        const result = await db.runAsync(sql, [user_id, leave_type, start_date, end_date, days_requested]);
        return result.lastID;
    }

    static async getPending() {
        const sql = `SELECT lr.*, u.name FROM leave_requests lr JOIN users u ON lr.user_id = u.id WHERE status = 'pending'`;
        return await db.allAsync(sql);
    }

    static async updateStatus(id, status) {
        const sql = `UPDATE leave_requests SET status = ? WHERE id = ?`;
        await db.runAsync(sql, [status, id]);
        if (status === 'approved') {
            const leave = await db.getAsync(`SELECT * FROM leave_requests WHERE id = ?`, [id]);
            await UserModel.updateLeaveBalance(leave.user_id, leave.leave_type, leave.days_requested);
        }
    }

    static async getUserLeaves(user_id, month, year) {
        const sql = `SELECT * FROM leave_requests WHERE user_id = ? AND strftime('%m', start_date) = ? AND strftime('%Y', start_date) = ? AND status = 'approved'`;
        return await db.allAsync(sql, [user_id, month.toString().padStart(2, '0'), year]);
    }

    static async getMonthlyOffs(user_id, month, year) {
        const offs = await this.getUserLeaves(user_id, month, year);
        return offs.reduce((total, leave) => total + leave.days_requested, 0);
    }
}

module.exports = LeaveModel;