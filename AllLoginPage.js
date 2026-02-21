// Known fixed roles
const knownUsers = {
    "sujanshrestha@gpkmc.edu.np": "SuperAdmin",
    "amrita.deula@gpkmc.edu.np": "Admin"
};

// Utility: Generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Utility: Get role from email pattern
function getRoleFromEmail(email) {
    email = email.toLowerCase().trim();
    if (knownUsers[email]) return knownUsers[email];

    const localPart = email.split('@')[0];
    if (localPart.includes('.')) {
        const parts = localPart.split('.');
        if (parts.length === 2 && /^\d+$/.test(parts[1])) {
            return "Student";
        }
    }
    return "Teacher";
}

// Check if user exists and has password set
function userExists(email) {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    return users[email.toLowerCase().trim()];
}

// Save user (email + hashed password simulation + role)
function saveUser(email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    // Simple hash simulation (in real app use proper bcrypt on backend)
    const simpleHash = btoa(password + email); 
    users[email.toLowerCase().trim()] = { passwordHash: simpleHash, role: getRoleFromEmail(email) };
    localStorage.setItem('users', JSON.stringify(users));
}

// Verify password (simulation)
function verifyPassword(email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const user = users[email.toLowerCase().trim()];
    if (!user) return false;
    return user.passwordHash === btoa(password + email);
}

// Current auth state
let currentEmail = '';
let currentOTP = '';
let otpExpiry = 0;
let authMode = ''; // 'signup', 'forgot', 'login'

// Reset form
function resetForm() {
    document.getElementById('otpSection').style.display = 'none';
    document.getElementById('newPasswordSection').style.display = 'none';
    document.getElementById('password').value = '';
    document.getElementById('otp').value = '';
    document.getElementById('newPassword').value = '';
    currentEmail = '';
    currentOTP = '';
    authMode = '';
}

// Start signup flow
function startSignup() {
    const email = document.getElementById('email').value.trim();
    if (!email.endsWith('@gpkmc.edu.np')) {
        alert('Only @gpkmc.edu.np emails allowed');
        return;
    }
    if (userExists(email)) {
        alert('Email already registered. Use Login or Forgot Password.');
        return;
    }

    authMode = 'signup';
    currentEmail = email;
    currentOTP = generateOTP();
    otpExpiry = Date.now() + 5 * 60 * 1000; // 5 min

    alert(`[SIMULATION] OTP sent to ${email}: ${currentOTP}\n(Valid for 5 minutes)`);
    document.getElementById('otpSection').style.display = 'block';
    document.getElementById('newPasswordSection').style.display = 'none';
}

// Start forgot password flow
function startForgotPassword() {
    const email = document.getElementById('email').value.trim();
    if (!email.endsWith('@gpkmc.edu.np')) {
        alert('Only @gpkmc.edu.np emails allowed');
        return;
    }
    if (!userExists(email)) {
        alert('Email not registered.');
        return;
    }

    authMode = 'forgot';
    currentEmail = email;
    currentOTP = generateOTP();
    otpExpiry = Date.now() + 5 * 60 * 1000;

    alert(`[SIMULATION] Reset OTP sent to ${email}: ${currentOTP}\n(Valid for 5 minutes)`);
    document.getElementById('otpSection').style.display = 'block';
    document.getElementById('newPasswordSection').style.display = 'none';
}

// Verify entered OTP
function verifyOTP() {
    const enteredOTP = document.getElementById('otp').value.trim();
    if (Date.now() > otpExpiry) {
        alert('OTP expired. Request a new one.');
        resetForm();
        return;
    }
    if (enteredOTP !== currentOTP) {
        alert('Invalid OTP');
        return;
    }

    alert('OTP verified successfully!');
    document.getElementById('otpSection').style.display = 'none';
    document.getElementById('newPasswordSection').style.display = 'block';
}

// Set password after OTP verification
function setPassword() {
    const newPass = document.getElementById('newPassword').value.trim();
    if (newPass.length < 8 || newPass.length > 20) {
        alert('Password must be 8-20 characters');
        return;
    }

    saveUser(currentEmail, newPass);
    alert('Password set successfully! You can now login.');
    resetForm();
}

// Handle normal login
function handleLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email.endsWith('@gpkmc.edu.np')) {
        alert('Mail not found');
        return;
    }
    if (!userExists(email)) {
        alert('User not registered. Sign up first.');
        return;
    }
    if (!verifyPassword(email, password)) {
        alert('Incorrect password');
        return;
    }

    const role = userExists(email).role;
    localStorage.setItem('currentRole', role);
    localStorage.setItem('currentEmail', email.toLowerCase().trim());

    document.getElementById('authContainer').style.display = 'none';
    document.getElementById(role + 'Dashboard').style.display = 'block';
}

// Logout
function logout() {
    localStorage.removeItem('currentRole');
    localStorage.removeItem('currentEmail');
    location.reload();
}

// Auto-login if already logged in
window.onload = function() {
    const currentRole = localStorage.getItem('currentRole');
    if (currentRole) {
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById(currentRole + 'Dashboard').style.display = 'block';
    }
};