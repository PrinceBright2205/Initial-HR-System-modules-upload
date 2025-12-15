const db = require('../config/db');

class ProfitModel {
    static async create(profit) {
        const { month, year, profit: amount } = profit;
        const sql = `INSERT OR REPLACE INTO monthly_profits (month, year, profit) VALUES (?, ?, ?)`;
        await db.runAsync(sql, [month, year, amount]);
    }

    static async getMonthly(month, year) {
        const sql = `SELECT * FROM monthly_profits WHERE month = ? AND year = ?`;
        return await db.getAsync(sql, [month, year]);
    }

    static async getYearly(year) {
        const sql = `SELECT * FROM monthly_profits WHERE year = ? ORDER BY month`;
        return await db.allAsync(sql, [year]);
    }

    static async getTotalYearly(year) {
        const profits = await this.getYearly(year);
        return profits.reduce((total, p) => total + p.profit, 0);
    }
}

module.exports = ProfitModel;