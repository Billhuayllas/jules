"use strict";
    const BackupManager = {
        backupFolderHandle: null, backupIntervalId: null, DB_NAME_CONFIG: 'appBackupConfigDB', CONFIG_STORE_KEY: 'generalBackupConfigGlobal',
        init: async function() { if (typeof localforage !== 'undefined') { localforage.config({ name: this.DB_NAME_CONFIG, storeName: 'configStoreBackup' }); } await this.cargarConfiguracionBackup(); },
        seleccionarCarpetaBackup: async function() { if (!window.showDirectoryPicker) { Swal.fire('Navegador no Compatible', 'Tu navegador no soporta la API para seleccionar carpetas.', 'warning'); return; } try { this.backupFolderHandle = await window.showDirectoryPicker(); const permiso = await this.backupFolderHandle.queryPermission({ mode: "readwrite" }); if (permiso !== "granted") { const request = await this.backupFolderHandle.requestPermission({ mode: "readwrite" }); if (request !== 'granted') { Swal.fire('Permiso Denegado', 'Se necesita permiso para escribir en la carpeta seleccionada.', 'error'); this.backupFolderHandle = null; return; } } document.getElementById("backup-general-folder").value = this.backupFolderHandle.name; Swal.fire('Carpeta Seleccionada', `Carpeta "${this.backupFolderHandle.name}" seleccionada para backups generales.`, 'info'); this.actualizarEstadoBackup(); } catch (error) { if (error.name !== 'AbortError') { Swal.fire("Error", "Error al seleccionar carpeta: " + error.message, 'error'); } this.backupFolderHandle = null; document.getElementById("backup-general-folder").value = ""; this.actualizarEstadoBackup(); } },
        guardarConfiguracionBackup: async function() { const folderText = document.getElementById("backup-general-folder").value; const interval = document.getElementById("backup-general-interval").value; if (!this.backupFolderHandle && folderText) { Swal.fire("Carpeta Requerida", "Debes seleccionar una carpeta antes de guardar la configuración.", "warning"); return; } else if (!this.backupFolderHandle && !folderText) { await localforage.setItem(this.CONFIG_STORE_KEY, { interval }); Swal.fire("Configuración Guardada", `Intervalo de respaldo guardado (${interval} min). Selecciona una carpeta para activar el auto-backup.`, "success"); this.iniciarRespaldoAutomático(); return; } await localforage.setItem(this.CONFIG_STORE_KEY, { interval }); Swal.fire("Configuración Guardada", "Configuración de backup general guardada. El respaldo automático se iniciará/actualizará.", "success"); this.iniciarRespaldoAutomático(); },
        cargarConfiguracionBackup: async function() { const config = await localforage.getItem(this.CONFIG_STORE_KEY) || {}; document.getElementById("backup-general-interval").value = config.interval || "60"; document.getElementById("backup-general-folder").value = ""; this.backupFolderHandle = null; this.iniciarRespaldoAutomático(); },
        iniciarRespaldoAutomático: async function() { const config = await localforage.getItem(this.CONFIG_STORE_KEY) || {}; const interval = parseInt(config.interval) || 60; if (this.backupIntervalId) clearInterval(this.backupIntervalId); if (this.backupFolderHandle) { this.backupIntervalId = setInterval(() => this.generarBackupGeneral(), interval * 60000); } this.actualizarEstadoBackup(); },
        actualizarEstadoBackup: async function() { const statusEl = document.getElementById('backup-general-status'); if (!statusEl) return; const config = await localforage.getItem(this.CONFIG_STORE_KEY) || {}; const interval = parseInt(config.interval) || 60; if (this.backupFolderHandle) { statusEl.textContent = `Respaldo automático activo cada ${interval} minutos en la carpeta "${this.backupFolderHandle.name}".`; statusEl.style.color = 'var(--success-color)'; } else { statusEl.textContent = `Respaldo automático configurado cada ${interval} minutos. Selecciona una carpeta para habilitarlo en esta sesión.`; statusEl.style.color = 'var(--warning-color)'; } },
        generarBackupGeneral: async function(manual = false) { if (!this.backupFolderHandle && !manual) { this.actualizarEstadoBackup(); return; } if (!this.backupFolderHandle && manual) { Swal.fire("Carpeta Requerida", "Por favor, selecciona una carpeta de destino para el backup manual.", "warning"); return; } showLoading("Generando backup general..."); try { const timestamp = new Date().toISOString().replace(/[:.]/g, "-"); const fileName = `backup_sistema_completo_${timestamp}.json`; const repuestosData = { productos: sistema.productos, series: sistema.series, categorias: sistema.categorias, marcas: sistema.marcas, juegos: sistema.juegos }; const pagosData = { pendientes: await SistemaPagos.memoryStorage.getPendientes(), historial: await SistemaPagos.memoryStorage.getHistorial() }; const cajaData = { caja: await SistemaCaja.memoryStorage.getItem(SistemaCaja.CAJA_KEY), banco: await SistemaCaja.memoryStorage.getItem(SistemaCaja.BANCO_KEY), general: await SistemaCaja.memoryStorage.getItem(SistemaCaja.GENERAL_KEY), historial: await SistemaCaja.memoryStorage.getItem(SistemaCaja.HISTORIAL_KEY) }; const contenidoCompleto = { version: "12.14", timestamp: new Date().toISOString(), repuestos: repuestosData, pagos: pagosData, caja: cajaData }; const contenidoStr = JSON.stringify(contenidoCompleto, null, 2); if (manual) { const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(contenidoStr); const a = document.createElement('a'); a.href = dataUri; a.download = fileName; a.click(); Swal.fire('Exportación Manual Exitosa', `Backup general "${fileName}" descargado.`, 'success'); } else if (this.backupFolderHandle) { const fileHandle = await this.backupFolderHandle.getFileHandle(fileName, { create: true }); const writable = await fileHandle.createWritable(); await writable.write(contenidoStr); await writable.close(); const statusEl = document.getElementById('backup-general-status'); if (statusEl) statusEl.textContent = `Último backup: ${new Date().toLocaleTimeString()} (${fileName}) en "${this.backupFolderHandle.name}"`; } } catch (error) { Swal.fire("Error de Backup General", "Error al generar/guardar el backup: " + error.message, "error"); const statusEl = document.getElementById('backup-general-status'); if (statusEl && !manual) statusEl.textContent = `Error en último backup: ${error.message}`; } finally { hideLoading(); } },
        exportarBackupGeneral: function() { this.generarBackupGeneral(true); },
        importarBackupGeneral: async function(event) {
            const file = event.target.files[0]; if (!file) return;
            showLoading("Importando backup general...");
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (!data.repuestos || !data.pagos || !data.caja || !data.version) { throw new Error("El archivo de backup no tiene el formato esperado."); }
                    const confirmResult = await Swal.fire({ title: 'Confirmar Importación General', html: `Se importarán datos desde un backup v${data.version}.<br><b>¡Esto REEMPLAZARÁ TODOS los datos existentes de Repuestos, Pagos y Caja!</b>`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#6c757d', confirmButtonText: 'Sí, importar y reemplazar', cancelButtonText: 'Cancelar' });
                    if (!confirmResult.isConfirmed) { event.target.value = null; hideLoading(); return; }

                    sistema.productos = (data.repuestos.productos || []).map(p => new Producto(p.id, p.codigo, p.nombre, p.marcaId, p.descripcion, p.categoria, p.medida, p.precio, p.costo, p.fob, p.stock, p.seriesId, p.imagenes, p.precioMayor, p.aplicaciones));
                    sistema.series = (data.repuestos.series || []).map(s => new Serie(s.id, s.codigo, s.nombre, s.color));
                    sistema.categorias = (data.repuestos.categorias || []).map(c => new Categoria(c.id, c.nombre));
                    sistema.marcas = (data.repuestos.marcas || []).map(m => new Marca(m.id, m.nombre));
                    sistema.juegos = (data.repuestos.juegos || []).map(j => new JuegoProducto(j.id, j.codigo, j.nombre, j.aplicaciones, j.componentes));
                    sistema.recalculateNextIds();
                    sistema.saveToLocalStorage();
                    if (menu.currentSectionId.startsWith('menu') || ['productosView', 'priceTableView', 'juegosView', 'seriesTableView', 'categoriesTableView', 'marcasView'].includes(menu.currentSectionId)) { sistema.renderAll(); }

                    await SistemaPagos.memoryStorage.setPendientes(data.pagos.pendientes || []);
                    await SistemaPagos.memoryStorage.setHistorial(data.pagos.historial || []);
                    if (menu.currentSectionId === 'pagosPendientesView') { await SistemaPagos.renderView(); }

                    await SistemaCaja.memoryStorage.setItem(SistemaCaja.CAJA_KEY, data.caja.caja || []);
                    await SistemaCaja.memoryStorage.setItem(SistemaCaja.BANCO_KEY, data.caja.banco || []);
                    await SistemaCaja.memoryStorage.setItem(SistemaCaja.GENERAL_KEY, data.caja.general || []);
                    await SistemaCaja.memoryStorage.setItem(SistemaCaja.HISTORIAL_KEY, data.caja.historial || []);
                    if (menu.currentSectionId === 'rendicionCajaView') { await SistemaCaja.renderView(); }

                    Swal.fire('Importación Completa', 'Todos los datos del sistema han sido restaurados desde el backup.', 'success');
                } catch (err) { Swal.fire('Error de Importación', 'No se pudo procesar el archivo de backup general: ' + err.message, 'error'); console.error("Error importando backup general:", err);
                } finally { event.target.value = null; hideLoading(); }
            };
            reader.readAsText(file);
        },
        clearAllData: async function() {
            const result = await Swal.fire({ title: '¿Borrar TODOS los datos del sistema?', html: "Esta acción eliminará <b>TODOS</b> los datos de <b>Repuestos, Pagos Pendientes y Rendición de Caja</b>.<br>¡No se puede deshacer!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí, borrar todo', cancelButtonText: 'Cancelar'});
            if (result.isConfirmed) {
                localStorage.clear();
                if (typeof localforage !== 'undefined') {
                    try {
                        await localforage.clear();
                    } catch(err) { console.error("Error limpiando localForage general:", err); }
                }
                await Swal.fire('Datos Borrados', 'Toda la información del sistema ha sido eliminada. Recargando...', 'success');
                window.location.reload();
            }
        }
    };
