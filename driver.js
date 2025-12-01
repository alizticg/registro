/* ============================================
   FUNCIONALIDADES DEL CHOFER
   ============================================ */

import { database } from './config.js';
import { ref, onValue } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { mostrarResultadosBusqueda } from './utils.js';

let currentChoferId = null;

/**
 * Busca pasajeros del chofer
 */
window.buscarPasajerosChofer = function() {
    const searchTerm = document.getElementById('searchDriverInput').value.toLowerCase();
    const misViajes = window.appState.viajes.filter(v => v.choferId === currentChoferId);
    const viajesIds = misViajes.map(v => v.id);
    
    const resultados = window.appState.pasajeros.filter(p => 
        viajesIds.includes(p.viajeId) &&
        (p.nombre.toLowerCase().includes(searchTerm) || 
        p.documento.toLowerCase().includes(searchTerm))
    );
    mostrarResultadosBusqueda(resultados, 'resultadosBusquedaChofer');
};

/**
 * Carga viajes del chofer
 */
export async function cargarViajesChofer(choferId) {
    currentChoferId = choferId;

    // Cargar viajes
    const viajesRef = ref(database, 'viajes');
    onValue(viajesRef, (snapshot) => {
        const misViajes = [];
        snapshot.forEach((childSnapshot) => {
            const viaje = { id: childSnapshot.key, ...childSnapshot.val() };
            if (viaje.choferId === choferId) {
                misViajes.push(viaje);
            }
        });
        window.appState.viajes = misViajes;
        mostrarViajesChofer(misViajes);
    });

    // Cargar pasajeros
    const pasajerosRef = ref(database, 'pasajeros');
    onValue(pasajerosRef, (snapshot) => {
        window.appState.pasajeros = [];
        snapshot.forEach((childSnapshot) => {
            window.appState.pasajeros.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        // Actualizar la vista cuando cambien los pasajeros
        const misViajes = window.appState.viajes.filter(v => v.choferId === choferId);
        mostrarViajesChofer(misViajes);
    });
}

function mostrarViajesChofer(misViajes) {
    const container = document.getElementById('viajesChofer');
    
    if (misViajes.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">📋 No tienes viajes asignados actualmente</p>';
        return;
    }

    container.innerHTML = misViajes.map(viaje => {
        const pasajerosViaje = window.appState.pasajeros.filter(p => p.viajeId === viaje.id);
        return `
            <div class="trip-item">
                <strong>🚐 ${viaje.origen} → ${viaje.destino}</strong><br>
                <strong>Fecha:</strong> ${viaje.fecha} a las ${viaje.hora}<br>
                <strong>Placa:</strong> ${viaje.placa}<br>
                <strong>Pasajeros:</strong> ${pasajerosViaje.length}/14<br>
                <div style="margin-top: 15px;">
                    <strong>📋 Lista de Pasajeros:</strong>
                    ${pasajerosViaje.length > 0 ? 
                        pasajerosViaje.map(p => `
                            <div style="margin-left: 20px; margin-top: 10px; padding: 10px; background: white; border-radius: 5px; border-left: 3px solid #10b981;">
                                👤 <strong>${p.nombre}</strong><br>
                                📄 Doc: ${p.documento}<br>
                                💺 Asiento: ${p.asiento}<br>
                                📞 Tel: ${p.telefono}
                            </div>
                        `).join('') 
                        : '<p style="margin-left: 20px; color: #666; margin-top: 10px;">No hay pasajeros registrados para este viaje</p>'
                    }
                </div>
            </div>
        `;
    }).join('');
}