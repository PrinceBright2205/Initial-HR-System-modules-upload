// Combined client-side JavaScript for the Inventory & HR System

// Display user information in header
document.addEventListener('DOMContentLoaded', function() {
    displayUserInfo();
});

async function displayUserInfo() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            // Decode token to get user info (simple decode, not secure for production)
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = payload.name || 'User';
            }
        } catch (error) {
            console.error('Error decoding token:', error);
        }
    }
}

// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const loginMessage = document.getElementById('loginMessage');

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();
            if (response.ok) {
                localStorage.setItem('token', result.token);
                loginMessage.style.color = 'green';
                loginMessage.textContent = 'Login successful!';
                // Redirect based on role
                if (result.role === 'manager' || result.role === 'admin') {
                    window.location.href = 'manager-approval.html';
                } else {
                    window.location.href = 'employee-dashboard.html';
                }
            } else {
                loginMessage.style.color = 'red';
                loginMessage.textContent = result.message;
            }
        });
    }

    // Registration functionality
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const name = document.getElementById('regName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const role = document.getElementById('regRole').value;
            const registerMessage = document.getElementById('registerMessage');

            // Client-side password validation
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
            if (!passwordRegex.test(password)) {
                registerMessage.style.color = 'red';
                registerMessage.textContent = 'Password must be at least 12 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.';
                return;
            }

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            });

            const result = await response.json();
            if (response.ok) {
                registerMessage.style.color = 'green';
                registerMessage.textContent = 'Registration successful! You can now log in.';
                registerForm.reset();
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                registerMessage.style.color = 'red';
                registerMessage.textContent = result.message;
            }
        });
    }
});

// Employee Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('logInventoryBtn')) {
        document.getElementById("logInventoryBtn").addEventListener("click", () => {
            window.location.href = "manager-approval.html";
        });
    }

    if (document.getElementById('applyLeaveBtn')) {
        document.getElementById("applyLeaveBtn").addEventListener("click", () => {
            window.location.href = "leave-application.html";
        });
    }

    if (document.getElementById('checkInBtn')) {
        document.getElementById("checkInBtn").addEventListener("click", async () => {
            const response = await fetch('/api/employee/time/checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const result = await response.json();
            alert(result.message);
        });
    }

    if (document.getElementById('startBreakBtn')) {
        document.getElementById("startBreakBtn").addEventListener("click", async () => {
            const response = await fetch('/api/employee/time/break/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const result = await response.json();
            alert(result.message);
        });
    }

    if (document.getElementById('endBreakBtn')) {
        document.getElementById("endBreakBtn").addEventListener("click", async () => {
            const response = await fetch('/api/employee/time/break/end', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const result = await response.json();
            alert(result.message);
        });
    }

    if (document.getElementById('checkOutBtn')) {
        document.getElementById("checkOutBtn").addEventListener("click", async () => {
            const response = await fetch('/api/employee/time/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const result = await response.json();
            alert(result.message);
        });
    }

    if (document.getElementById('viewReportBtn')) {
        document.getElementById("viewReportBtn").addEventListener("click", async () => {
            const month = prompt("Enter month (1-12):");
            const year = prompt("Enter year:");
            const response = await fetch(`/api/employee/report/${month}/${year}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const result = await response.json();
            alert(`Hours: ${result.hours}, Offs: ${result.offs}`);
        });
    }
});

// Leave Application functionality
document.addEventListener('DOMContentLoaded', function() {
    const leaveForm = document.getElementById('leaveForm');
    if (leaveForm) {
        leaveForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const leaveType = document.getElementById("leaveType").value;
            const start = document.getElementById("start").value;
            const end = document.getElementById("end").value;

            const response = await fetch('/api/employee/leave/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ leave_type: leaveType, start_date: start, end_date: end })
            });

            const result = await response.json();
            const messageDiv = document.getElementById("message");
            messageDiv.innerHTML = `<span class="${response.ok ? 'text-success' : 'text-danger'}">${result.message}</span>`;
            if (response.ok) leaveForm.reset();
        });
    }
});

// Manager Approval functionality
async function loadLeaveRequests() {
    const response = await fetch('/api/manager/leave/requests', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const leaves = await response.json();
    const tbody = document.getElementById('leaveRequestsBody');
    tbody.innerHTML = '';
    leaves.forEach(leave => {
        const row = `
            <tr>
                <td>${leave.id}</td>
                <td>${leave.name}</td>
                <td>${leave.leave_type}</td>
                <td>${leave.start_date}</td>
                <td>${leave.end_date}</td>
                <td>${leave.days_requested}</td>
                <td>${leave.status}</td>
                <td><button class="btn btn-success btn-sm" onclick="approveLeave(${leave.id})">Approve</button></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

async function approveLeave(id) {
    const response = await fetch(`/api/manager/leave/approve/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const result = await response.json();
    alert(result.message);
    loadLeaveRequests();
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('leaveRequestsBody')) {
        loadLeaveRequests();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const profitForm = document.getElementById('profitForm');
    if (profitForm) {
        profitForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const month = document.getElementById("profitMonth").value;
            const year = document.getElementById("profitYear").value;
            const profit = document.getElementById("profitAmount").value;
            const response = await fetch('/api/manager/profit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ month, year, profit })
            });
            const result = await response.json();
            alert(result.message);
        });
    }

    if (document.getElementById('checkRedundancyBtn')) {
        document.getElementById("checkRedundancyBtn").addEventListener("click", async () => {
            const month = prompt("Enter month (1-12):");
            const year = prompt("Enter year:");
            const response = await fetch(`/api/manager/redundancy/${month}/${year}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const result = await response.json();
            alert(`Redundant workers: ${result.redundants.map(r => r.name).join(', ')}`);
        });
    }

    if (document.getElementById('annualSummaryBtn')) {
        document.getElementById("annualSummaryBtn").addEventListener("click", async () => {
            const year = prompt("Enter year:");
            const response = await fetch(`/api/manager/summary/${year}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const result = await response.json();
            console.log(result); // For now, log to console
            alert(`Total Profit: ${result.totalProfit}`);
        });
    }

    // Logout functionality
    if (document.getElementById('logoutBtn')) {
        document.getElementById('logoutBtn').addEventListener('click', function() {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        });
    }
});