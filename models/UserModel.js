const db = require('../config/db');

class UserModel {
    static async create(user) {
        const { name, email, password, role, hire_date } = user;
        const sql = `INSERT INTO users (name, email, password, role, hire_date) VALUES (?, ?, ?, ?, ?)`;
        const result = await db.runAsync(sql, [name, email, password, role, hire_date]);
        return result.lastID;
    }

    static async findByEmail(email) {
        const sql = `SELECT * FROM users WHERE email = ?`;
        return await db.getAsync(sql, [email]);
    }

    static async findById(id) {
        const sql = `SELECT * FROM users WHERE id = ?`;
        return await db.getAsync(sql, [id]);
    }

    static async getAll() {
        const sql = `SELECT id, name, email, role, hire_date, annual_leave_balance, sick_leave_balance FROM users`;
        return await db.allAsync(sql);
    }

    static async updateLeaveBalance(user_id, leave_type, days) {
        let column = leave_type === 'annual' ? 'annual_leave_balance' : 'sick_leave_balance';
        const sql = `UPDATE users SET ${column} = ${column} - ? WHERE id = ?`;
        await db.runAsync(sql, [days, user_id]);
    }
}

module.exports = UserModel;