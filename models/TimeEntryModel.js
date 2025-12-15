const db = require('../config/db');

class TimeEntryModel {
    static async create(entry) {
        const { user_id, date, check_in, break_start, break_end, check_out, total_hours } = entry;
        const sql = `INSERT INTO time_entries (user_id, date, check_in, break_start, break_end, check_out, total_hours) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const result = await db.runAsync(sql, [user_id, date, check_in, break_start, break_end, check_out, total_hours]);
        return result.lastID;
    }

    static async getUserEntries(user_id, month, year) {
        const sql = `SELECT * FROM time_entries WHERE user_id = ? AND strftime('%m', date) = ? AND strftime('%Y', date) = ?`;
        return await db.allAsync(sql, [user_id, month.toString().padStart(2, '0'), year]);
    }

    static async getMonthlyHours(user_id, month, year) {
        const entries = await this.getUserEntries(user_id, month, year);
        return entries.reduce((total, entry) => total + (entry.total_hours || 0), 0);
    }

    static async updateEntry(id, updates) {
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        values.push(id);
        const sql = `UPDATE time_entries SET ${fields} WHERE id = ?`;
        await db.runAsync(sql, values);
    }

    static async getTodayEntry(user_id, date) {
        const sql = `SELECT * FROM time_entries WHERE user_id = ? AND date = ?`;
        return await db.getAsync(sql, [user_id, date]);
    }
}

module.exports = TimeEntryModel;