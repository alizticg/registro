/* ============================================
   FUNCIONALIDADES DEL ADMINISTRADOR
   ============================================ */

import { database, usuarios } from './config.js';
import { ref, set, push, onValue, remove } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { mostrarAlerta, mostrarResultadosBusqueda, actualizarSelectViajes, actualizarEstadisticas } from './utils.js';

/**
 * Registra un nuevo pasajero
 */
window.registrarPasajero = async function(e) {
    e.preventDefault();
    
    const viajeId = document.getElementById('viajeSelect').value;
    const asiento = parseInt(document.getElementById('asientoPasajero').value);
    
    // Validar que el asiento esté en rango válido
    if (asiento < 1 || asiento > 14) {
        mostrarAlerta('alertRegistro', '❌ El asiento debe estar entre 1 y 14', 'danger');
        return;
    }
    
    // Validar capacidad del viaje
    const pasajerosEnViaje = window.appState.pasajeros.filter(p => p.viajeId === viajeId);
    
    if (pasajerosEnViaje.length >= 14) {
        mostrarAlerta('alertRegistro', '❌ Este viaje ya alcanzó la capacidad máxima (14 pasajeros)', 'danger');
        return;
    }
    
    // Validar asiento duplicado - CRÍTICO
    const asientoOcupado = pasajerosEnViaje.find(p => parseInt(p.asiento) === asiento);
    if (asientoOcupado) {
        mostrarAlerta('alertRegistro', `❌ El asiento ${asiento} ya está ocupado por ${asientoOcupado.nombre}`, 'danger');
        return;
    }
    
    const pasajero = {
        nombre: document.getElementById('nombrePasajero').value,
        documento: document.getElementById('documentoPasajero').value,
        telefono: document.getElementById('telefonoPasajero').value,
        email: document.getElementById('emailPasajero').value,
        viajeId: viajeId,
        asiento: asiento,
        fechaRegistro: new Date().toISOString()
    };

    try {
        const newPasajeroRef = push(ref(database, 'pasajeros'));
        await set(newPasajeroRef, pasajero);
        mostrarAlerta('alertRegistro', '✅ Pasajero registrado exitosamente', 'success');
        e.target.reset();
    } catch (error) {
        mostrarAlerta('alertRegistro', '❌ Error: ' + error.message, 'danger');
    }
};

/**
 * Eliminar pasajero
 */
window.eliminarPasajero = async function(pasajeroId, nombrePasajero) {
    if (!confirm(`¿Está seguro que desea eliminar al pasajero ${nombrePasajero}?`)) {
        return;
    }
    
    try {
        await remove(ref(database, 'pasajeros/' + pasajeroId));
        mostrarAlerta('alertRegistro', '✅ Pasajero eliminado exitosamente', 'success');
        // Actualizar búsqueda si hay texto
        const searchInput = document.getElementById('searchInput');
        if (searchInput && searchInput.value) {
            window.buscarPasajeros();
        }
    } catch (error) {
        alert('❌ Error al eliminar pasajero: ' + error.message);
    }
};

/**
 * Crea un nuevo viaje
 */
window.crearViaje = async function(e) {
    e.preventDefault();
    
    const choferId = document.getElementById('choferViaje').value;
    const viaje = {
        origen: document.getElementById('origenViaje').value,
        destino: document.getElementById('destinoViaje').value,
        fecha: document.getElementById('fechaViaje').value,
        hora: document.getElementById('horaViaje').value,
        choferId: choferId,
        choferNombre: usuarios[choferId].nombre,
        placa: document.getElementById('placaViaje').value,
        capacidad: 14,
        ocupados: 0
    };

    try {
        const newViajeRef = push(ref(database, 'viajes'));
        await set(newViajeRef, viaje);
        mostrarAlerta('alertViaje', '✅ Viaje creado exitosamente', 'success');
        e.target.reset();
    } catch (error) {
        mostrarAlerta('alertViaje', '❌ Error: ' + error.message, 'danger');
    }
};

/**
 * Elimina un viaje que ya pasó su fecha
 */
window.eliminarViaje = async function(viajeId) {
    if (!confirm('¿Está seguro que desea eliminar este viaje?')) {
        return;
    }
    
    try {
        // Eliminar pasajeros del viaje primero
        const pasajerosDelViaje = window.appState.pasajeros.filter(p => p.viajeId === viajeId);
        for (const pasajero of pasajerosDelViaje) {
            await remove(ref(database, 'pasajeros/' + pasajero.id));
        }
        
        // Luego eliminar el viaje
        await remove(ref(database, 'viajes/' + viajeId));
        mostrarAlerta('alertViaje', '✅ Viaje eliminado exitosamente', 'success');
    } catch (error) {
        alert('❌ Error al eliminar viaje: ' + error.message);
    }
};

/**
 * Busca pasajeros
 */
window.buscarPasajeros = function() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const resultados = window.appState.pasajeros.filter(p => 
        p.nombre.toLowerCase().includes(searchTerm) || 
        p.documento.toLowerCase().includes(searchTerm)
    );
    mostrarResultadosPasajerosAdmin(resultados);
};

/**
 * Muestra resultados de búsqueda con opción de eliminar
 */
function mostrarResultadosPasajerosAdmin(resultados) {
    const container = document.getElementById('resultadosBusqueda');
    
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
                <strong>Asiento:</strong> ${p.asiento}<br>
                <button class="btn btn-danger" style="margin-top: 10px;" onclick="eliminarPasajero('${p.id}', '${p.nombre}')">🗑️ Eliminar</button>
            </div>
        `;
    }).join('');
}

/**
 * Agregar nuevo chofer
 */
window.agregarChofer = async function(e) {
    e.preventDefault();
    
    // Contar choferes actuales
    const choferesActuales = Object.keys(usuarios).filter(key => usuarios[key].role === 'chofer').length;
    
    if (choferesActuales >= 20) {
        mostrarAlerta('alertChofer', '❌ Ya se alcanzó el máximo de 20 choferes', 'danger');
        return;
    }
    
    const nombreChofer = document.getElementById('nombreChofer').value;
    const usuarioChofer = document.getElementById('usuarioChofer').value.toLowerCase().trim();
    const passwordChofer = document.getElementById('passwordChofer').value;
    
    // Validar campos
    if (!nombreChofer || !usuarioChofer || !passwordChofer) {
        mostrarAlerta('alertChofer', '❌ Todos los campos son obligatorios', 'danger');
        return;
    }
    
    // Validar que el usuario no exista
    if (usuarios[usuarioChofer]) {
        mostrarAlerta('alertChofer', '❌ El usuario ya existe', 'danger');
        return;
    }
    
    // Agregar chofer
    usuarios[usuarioChofer] = {
        password: passwordChofer,
        role: 'chofer',
        nombre: nombreChofer,
        id: usuarioChofer
    };
    
    // Guardar en localStorage para persistencia
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    mostrarAlerta('alertChofer', '✅ Chofer agregado exitosamente', 'success');
    e.target.reset();
    cargarChoferesSelect();
    mostrarChoferes();
};

/**
 * Eliminar chofer
 */
window.eliminarChofer = function(choferId) {
    if (choferId === 'chofer1' || choferId === 'chofer2' || choferId === 'chofer3') {
        alert('❌ No se puede eliminar los choferes predeterminados');
        return;
    }
    
    if (!confirm('¿Está seguro que desea eliminar este chofer?')) {
        return;
    }
    
    // Verificar que no tenga viajes asignados
    const viajesChofer = window.appState.viajes.filter(v => v.choferId === choferId);
    if (viajesChofer.length > 0) {
        alert('❌ No se puede eliminar un chofer con viajes asignados. Primero elimine sus viajes.');
        return;
    }
    
    delete usuarios[choferId];
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    mostrarAlerta('alertChofer', '✅ Chofer eliminado exitosamente', 'success');
    cargarChoferesSelect();
    mostrarChoferes();
};

/**
 * Carga datos del administrador
 */
export async function cargarDatosAdmin() {
    // Cargar usuarios guardados
    const usuariosGuardados = localStorage.getItem('usuarios');
    if (usuariosGuardados) {
        const usuariosStorage = JSON.parse(usuariosGuardados);
        Object.assign(usuarios, usuariosStorage);
    }
    
    // Cargar viajes
    const viajesRef = ref(database, 'viajes');
    onValue(viajesRef, (snapshot) => {
        window.appState.viajes = [];
        snapshot.forEach((childSnapshot) => {
            window.appState.viajes.push({ 
                id: childSnapshot.key, 
                ...childSnapshot.val() 
            });
        });
        actualizarSelectViajes();
        mostrarViajes();
        mostrarChoferes(); // Actualizar choferes cuando cambien viajes
        actualizarEstadisticas();
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
        mostrarViajes(); // Actualizar vista de viajes con pasajeros
        actualizarEstadisticas();
    });

    cargarChoferesSelect();
    mostrarChoferes();
}

function cargarChoferesSelect() {
    const choferSelect = document.getElementById('choferViaje');
    if (!choferSelect) return;
    
    choferSelect.innerHTML = '<option value="">Seleccione un chofer</option>';
    Object.keys(usuarios).forEach(key => {
        if (usuarios[key].role === 'chofer') {
            choferSelect.innerHTML += `<option value="${key}">${usuarios[key].nombre}</option>`;
        }
    });
}

function mostrarViajes() {
    const container = document.getElementById('listaViajes');
    if (!container) return;
    
    if (window.appState.viajes.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No hay viajes programados</p>';
        return;
    }
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    container.innerHTML = window.appState.viajes.map(viaje => {
        const pasajerosViaje = window.appState.pasajeros.filter(p => p.viajeId === viaje.id);
        const fechaViaje = new Date(viaje.fecha + 'T00:00:00');
        const esPasado = fechaViaje < hoy;
        
        // Obtener asientos ocupados
        const asientosOcupados = pasajerosViaje.map(p => parseInt(p.asiento)).sort((a, b) => a - b);
        
        return `
            <div class="trip-item" style="${esPasado ? 'opacity: 0.6; border-left-color: #dc3545;' : ''}">
                <strong>🚐 ${viaje.origen} → ${viaje.destino}</strong>
                ${esPasado ? '<span style="color: #dc3545; font-weight: bold;"> (PASADO)</span>' : ''}<br>
                <strong>Fecha:</strong> ${viaje.fecha} a las ${viaje.hora}<br>
                <strong>Chofer:</strong> ${viaje.choferNombre}<br>
                <strong>Placa:</strong> ${viaje.placa}<br>
                <strong>Ocupación:</strong> ${pasajerosViaje.length}/14 asientos<br>
                <strong>Asientos ocupados:</strong> ${asientosOcupados.length > 0 ? asientosOcupados.join(', ') : 'Ninguno'}
                ${esPasado ? `<br><button class="btn btn-danger" style="margin-top: 10px;" onclick="eliminarViaje('${viaje.id}')">🗑️ Eliminar Viaje</button>` : ''}
            </div>
        `;
    }).join('');
}

function mostrarChoferes() {
    const container = document.getElementById('listaChoferes');
    if (!container) return;
    
    const choferes = Object.keys(usuarios).filter(key => usuarios[key].role === 'chofer');
    
    // Actualizar contador
    const totalChoferesElement = document.getElementById('totalChoferes');
    if (totalChoferesElement) {
        totalChoferesElement.textContent = choferes.length;
    }
    
    container.innerHTML = choferes.map(key => {
        const chofer = usuarios[key];
        // CORRECCIÓN CRÍTICA: Contar viajes correctamente
        const viajesChofer = window.appState.viajes.filter(v => v.choferId === key);
        const esPredeterminado = ['chofer1', 'chofer2', 'chofer3'].includes(key);
        
        return `
            <div class="card">
                <h3>👤 ${chofer.nombre}</h3>
                <p><strong>Usuario:</strong> ${key}</p>
                <p><strong>Viajes asignados:</strong> ${viajesChofer.length}</p>
                ${!esPredeterminado ? `<button class="btn btn-danger" onclick="eliminarChofer('${key}')">🗑️ Eliminar Chofer</button>` : ''}
            </div>
        `;
    }).join('');
}