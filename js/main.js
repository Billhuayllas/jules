"use strict";
    let sistema;
    let menu;
    document.addEventListener('DOMContentLoaded', async ()=>{
        try{
            sistema = new SistemaRepuestos();
            menu = new MenuHandler();
            await BackupManager.init();

            const initialMenuId = menu.m[menu.currentSectionId];
             if (initialMenuId) {
                 const activeMenuItem = document.getElementById(initialMenuId);
                 const parentSubmenu = activeMenuItem?.closest('.submenu');
                 if (parentSubmenu && !parentSubmenu.classList.contains('active')) {
                     menu.openSubmenu(parentSubmenu.id);
                 }
             } else {
                menu.openSubmenu('productosSubmenu');
             }
            menu.showSection(menu.currentSectionId);
            document.getElementById('searchInput')?.focus();
        } catch(error) {
            console.error("ERROR FATAL INICIALIZACIÓN:", error);
            hideLoading();
            document.body.innerHTML = `<div style='padding:20px; background:#f8d7da; color:#721c24; border:1px solid #f5c6cb; border-radius:5px; margin:20px;'><h1>Error Crítico</h1><p>No se pudo iniciar la aplicación.</p><p><strong>Mensaje:</strong> ${error.message}</p><pre style="white-space:pre-wrap; word-wrap:break-word; background:#f1f1f1; padding:10px; border-radius:3px; margin-top:10px;">${error.stack || 'No stack available.'}</pre><p style="margin-top:15px;">Intente borrar los datos locales del navegador y recargar la página. <strong>¡Esto eliminará toda la información guardada!</strong></p><button onclick="localStorage.clear(); if(typeof localforage !== 'undefined') localforage.clear().catch(e => console.error('Error clearing LF on critical error:', e)); window.location.reload();" style="padding:8px 15px; background:#dc3545; color:white; border:none; border-radius:4px; cursor:pointer;">Borrar Datos y Recargar</button></div>`;
        }
    });
