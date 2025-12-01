/* ============================================
   SISTEMA DE AUTENTICACIÓN
   ============================================ */

import { usuarios } from './config.js';
import { cargarDatosAdmin } from './admin.js';
import { cargarViajesChofer } from './driver.js';

let currentUser = null;

/**
 * Función de inicio de sesión
 */
window.login = function() {
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value;

    if (!user || !pass) {
        alert('Por favor, complete todos los campos');
        return;
    }

    if (usuarios[user] && usuarios[user].password === pass) {
        currentUser = { ...usuarios[user], username: user };
        document.querySelector('.login-section').classList.remove('active');
        
        if (currentUser.role === 'admin') {
            document.querySelector('.admin-section').classList.add('active');
            document.getElementById('adminName').textContent = currentUser.nombre;
            cargarDatosAdmin();
        } else {
            document.querySelector('.driver-section').classList.add('active');
            document.getElementById('driverName').textContent = currentUser.nombre;
            cargarViajesChofer(currentUser.username);
        }
    } else {
        alert('Usuario o contraseña incorrectos');
    }
};

/**
 * Función de cierre de sesión
 */
window.logout = function() {
    if (!confirm('¿Está seguro que desea cerrar sesión?')) {
        return;
    }

    currentUser = null;
    document.querySelector('.admin-section').classList.remove('active');
    document.querySelector('.driver-section').classList.remove('active');
    document.querySelector('.login-section').classList.add('active');
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
};

export function getCurrentUser() {
    return currentUser;
}

export function setCurrentUser(user) {
    currentUser = user;
}

// Enter en login
document.addEventListener('DOMContentLoaded', () => {
    const loginPass = document.getElementById('loginPass');
    if (loginPass) {
        loginPass.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                window.login();
            }
        });
    }
});