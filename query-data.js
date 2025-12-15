const db = require('./config/db');

async function getUsersData() {
    try {
        console.log('=== MANAGER DATA ===');
        const manager = await db.getAsync('SELECT id, name, email, role, hire_date FROM users WHERE role = ?', ['manager']);
        console.log(JSON.stringify(manager, null, 2));

        console.log('\n=== ALL 100 EMPLOYEES ===');
        const employees = await db.allAsync('SELECT id, name, email, role, hire_date FROM users WHERE role = ? ORDER BY id', ['employee']);
        employees.forEach((emp, index) => {
            console.log(`${index + 1}. ${JSON.stringify(emp)}`);
        });

        console.log('\n=== MANAGER DASHBOARD DATA ===');

        // Pending leave requests
        console.log('\nPending Leave Requests:');
        const pendingLeaves = await db.allAsync(`
            SELECT lr.id, u.name, lr.leave_type, lr.start_date, lr.end_date, lr.days_requested, lr.status
            FROM leave_requests lr
            JOIN users u ON lr.user_id = u.id
            WHERE lr.status = 'pending'
            ORDER BY lr.id
        `);
        console.log(`Total pending: ${pendingLeaves.length}`);
        pendingLeaves.slice(0, 5).forEach(leave => console.log(JSON.stringify(leave, null, 2)));

        // Monthly profits
        console.log('\nMonthly Profits:');
        const profits = await db.allAsync('SELECT * FROM monthly_profits ORDER BY year DESC, month DESC LIMIT 12');
        profits.forEach(profit => console.log(JSON.stringify(profit, null, 2)));

        // Recent time entries (sample)
        console.log('\nSample Time Entries (First Employee):');
        const timeEntries = await db.allAsync('SELECT * FROM time_entries WHERE user_id = 2 LIMIT 5');
        timeEntries.forEach(entry => console.log(JSON.stringify(entry, null, 2)));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

getUsersData();