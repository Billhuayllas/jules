"use strict";
    const DEFAULT_IMAGE_SVG='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2NjYyIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIj48L2NpcmNsZT48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI0Ij48L2NpcmNsZT48bGluZSB4MT0iNC45MyIgeTE9IjQuOTMiIHgyPSI5LjE3IiB5Mj0iOS4xNyI+PC9saW5lPjxsaW5lIHgxPSIxNC44MyIgeTE9IjE0LjgzIiB5Mj0iMTkuMDciIHkyPSIxOS4wNyI+PC9saW5lPjxsaW5lIHgxPSIxNC44MyIgeTE9IjkuMTciIHgyPSIxOS4wNyIgeTI9IjQuOTMiPjwvbGluZT48bGluZSB4MT0iMTQuODMiIHkyPSIxNC44MyIgeDI9IjE5LjA3IiB5MT0iOS4xNyI+PC9saW5lPjxsaW5lIHgxPSI0LjkzIiB5Mj0iMTQuODMiIHgyPSI5LjE3IiB5MT0iOS4xNyI+PC9saW5lPjwvc3ZnPg==';
    const MAX_DATA_URL_LENGTH=1*1024*1024;
    const MAX_IMAGES=5;

    function showLoading(message = "Procesando...") {
        const overlay = document.getElementById('loadingOverlay');
        const msgEl = document.getElementById('loadingMessage');
        if (overlay) {
            if(msgEl) msgEl.textContent = message;
            overlay.style.display = 'flex';
        }
    }
    function hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.style.display = 'none';
    }
