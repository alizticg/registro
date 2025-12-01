/* ============================================
   FUNCIONES UTILITARIAS
   ============================================ */

/**
 * Muestra una alerta temporal
 */
export function mostrarAlerta(elementId, mensaje, tipo) {
    const alertDiv = document.getElementById(elementId);
    alertDiv.innerHTML = `<div class="alert alert-${tipo}">${mensaje}</div>`;
    setTimeout(() => alertDiv.innerHTML = '', 5000);
}

/**
 * Muestra los resultados de búsqueda
 */
export function mostrarResultadosBusqueda(resultados, containerId) {
    const container = document.getElementById(containerId);
    
    if (resultados.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No se encontraron resultados</p>';
        return;
    }

    container.innerHTML = resultados.map(p => {
        const viaje = window.appState.viajes.find(v => v.id === p.viajeId);
        return `
            <div class="passenger-item">
                <strong>👤 ${p.nombre}</strong><br>
                <strong>Doc:</strong> ${p.documento}<br>
                <strong>Tel:</strong> ${p.telefono}<br>
                <strong>Email:</strong> ${p.email || 'N/A'}<br>
                <strong>Viaje:</strong> ${viaje ? `${viaje.origen} → ${viaje.destino}` : 'N/A'}<br>
                <strong>Asiento:</strong> ${p.asiento}
            </div>
        `;
    }).join('');
}

/**
 * Actualiza el select de viajes
 */
export function actualizarSelectViajes() {
    const select = document.getElementById('viajeSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccione un viaje</option>';
    
    window.appState.viajes.forEach(viaje => {
        select.innerHTML += `
            <option value="${viaje.id}">
                ${viaje.origen} → ${viaje.destino} | ${viaje.fecha} ${viaje.hora}
            </option>
        `;
    });
}

/**
 * Actualiza las estadísticas
 */
export function actualizarEstadisticas() {
    const totalViajes = document.getElementById('totalViajes');
    const totalPasajeros = document.getElementById('totalPasajeros');
    
    if (totalViajes) totalViajes.textContent = window.appState.viajes.length;
    if (totalPasajeros) totalPasajeros.textContent = window.appState.pasajeros.length;
}

/**
 * Cambia entre pestañas
 */
export function showTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById('tab-' + tabName).classList.add('active');
}

window.showTab = showTab;