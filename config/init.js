const fs = require('fs');
const path = require('path');
const db = require('./db');

async function initializeDatabase() {
    try {
        // Check if database file exists and has tables
        const dbPath = path.join(__dirname, '../../database.db');
        if (fs.existsSync(dbPath)) {
            console.log('Database already exists, skipping initialization');
            return;
        }

        // Read schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Execute schema
        await db.runAsync(schema);
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

module.exports = initializeDatabase;