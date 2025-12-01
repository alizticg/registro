/* ============================================
   CONFIGURACIÓN DE FIREBASE Y USUARIOS
   ============================================ */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDaLRtJLrVRpHph4lwGPZZdwitS8vhHnRo",
    authDomain: "registro-system.firebaseapp.com",
    databaseURL: "https://registro-system-default-rtdb.firebaseio.com",
    projectId: "registro-system",
    storageBucket: "registro-system.firebasestorage.app",
    messagingSenderId: "334558078608",
    appId: "1:334558078608:web:4cb95d8ec83a94b95c5a15"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Usuarios de prueba del sistema
const usuarios = {
    admin: { 
        password: 'admin123', 
        role: 'admin', 
        nombre: 'Administrador' 
    },
    chofer1: { 
        password: 'chofer123', 
        role: 'chofer', 
        nombre: 'Juan Pérez', 
        id: 'chofer1' 
    },
    chofer2: { 
        password: 'chofer123', 
        role: 'chofer', 
        nombre: 'María García', 
        id: 'chofer2' 
    },
    chofer3: { 
        password: 'chofer123', 
        role: 'chofer', 
        nombre: 'Carlos López', 
        id: 'chofer3' 
    }
};

// Variables globales compartidas - IMPORTANTE: Se exportan para todos los módulos
window.appState = {
    currentUser: null,
    viajes: [],
    pasajeros: []
};

// Exportar para uso en otros módulos
export { database, usuarios };