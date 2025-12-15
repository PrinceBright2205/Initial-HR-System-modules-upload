const db = require('../config/db');

class InventoryModel {
    static async getAll() {
        const sql = `SELECT * FROM inventory`;
        return await db.all(sql);
    }

    static async create(item) {
        const { item_name, quantity } = item;
        const sql = `INSERT INTO inventory (item_name, quantity) VALUES (?, ?)`;
        const result = await db.run(sql, [item_name, quantity]);
        return result.lastID;
    }

    static async updateQuantity(id, change) {
        const sql = `UPDATE inventory SET quantity = quantity + ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?`;
        await db.run(sql, [change, id]);
    }
}

module.exports = InventoryModel;