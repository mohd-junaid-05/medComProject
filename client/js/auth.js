import api from './api.js';

const TOKEN_KEY = 'medcomm_token';
const DOCTOR_KEY = 'medcomm_doctor';

export const Auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getDoctor: () => JSON.parse(localStorage.getItem(DOCTOR_KEY) || 'null'),
  isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),

  save: (token, doctor) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(DOCTOR_KEY, JSON.stringify(doctor));
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(DOCTOR_KEY);
    window.location.href = '/login';
  },

  requireAuth: () => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      window.location.href = '/login';
      return false;
    }
    return true;
  },
};

// Handle Register Form
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertEl = document.getElementById('form-alert');
    const btn = registerForm.querySelector('button[type="submit"]');

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const specialization = document.getElementById('specialization').value;

    if (!name || !email || !password || !specialization) {
      showAlert(alertEl, 'All fields are required.', 'error');
      return;
    }

    try {
      btn.disabled = true;
      btn.textContent = 'Creating account...';

      const data = await api.post('/auth/register', { name, email, password, specialization });
      Auth.save(data.token, data.doctor);
      showAlert(alertEl, 'Account created! Redirecting...', 'success');
      setTimeout(() => (window.location.href = '/dashboard'), 1000);
    } catch (err) {
      showAlert(alertEl, err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Create Account';
    }
  });
}

// Handle Login Form
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertEl = document.getElementById('form-alert');
    const btn = loginForm.querySelector('button[type="submit"]');

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      showAlert(alertEl, 'Email and password are required.', 'error');
      return;
    }

    try {
      btn.disabled = true;
      btn.textContent = 'Signing in...';

      const data = await api.post('/auth/login', { email, password });
      Auth.save(data.token, data.doctor);
      showAlert(alertEl, 'Login successful! Redirecting...', 'success');
      setTimeout(() => (window.location.href = '/dashboard'), 1000);
    } catch (err) {
      showAlert(alertEl, err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  });
}

// Handle logout buttons
document.querySelectorAll('.logout-btn').forEach((btn) => {
  btn.addEventListener('click', Auth.logout);
});

// Populate sidebar user info
const sidebarName = document.getElementById('sidebar-name');
const sidebarRole = document.getElementById('sidebar-role');
const sidebarAvatar = document.getElementById('sidebar-avatar');
if (sidebarName) {
  const doctor = Auth.getDoctor();
  if (doctor) {
    sidebarName.textContent = doctor.name;
    sidebarRole.textContent = doctor.specialization;
    sidebarAvatar.textContent = doctor.name.charAt(0).toUpperCase();
  }
}

function showAlert(el, msg, type) {
  if (!el) return;
  el.textContent = msg;
  el.className = `alert alert-${type} show`;
}

export function showAlert2(el, msg, type) {
  showAlert(el, msg, type);
}

export default Auth;
