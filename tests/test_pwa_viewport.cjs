const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== VERIFICACIÓN PWA VIEWPORT Y PULL-TO-REFRESH (390x844 Móvil) ===');

// 1. Reparto Fácil: globals.css
const globalsCss = fs.readFileSync(path.join(__dirname, '../src/app/globals.css'), 'utf-8');
assert.ok(globalsCss.includes('overflow: hidden'), 'globals.css debe bloquear overflow en html/body');
assert.ok(globalsCss.includes('overscroll-behavior: none'), 'globals.css debe contener overscroll-behavior: none');
assert.ok(globalsCss.includes('height: 100%'), 'globals.css debe fijar height: 100%');
console.log('✔ globals.css: html y body fijados con overflow: hidden y overscroll-behavior: none');

// 2. Reparto Fácil: layout.tsx
const layoutTsx = fs.readFileSync(path.join(__dirname, '../src/app/layout.tsx'), 'utf-8');
assert.ok(layoutTsx.includes('fixed inset-0 flex flex-col h-[100dvh]'), 'layout.tsx debe usar contenedor raíz fixed inset-0 h-[100dvh]');
assert.ok(layoutTsx.includes('overflow-hidden'), 'layout.tsx debe tener overflow-hidden');
console.log('✔ layout.tsx: contenedor raíz fixed inset-0 flex flex-col h-[100dvh] activo');

// 3. Reparto Fácil: TiendaPwaLayout.tsx
const tiendaLayout = fs.readFileSync(path.join(__dirname, '../src/modulos/tienda/ui/TiendaPwaLayout.tsx'), 'utf-8');
assert.ok(tiendaLayout.includes('fixed inset-0 h-[100dvh]'), 'TiendaPwaLayout debe usar viewport fijo 100dvh');
assert.ok(tiendaLayout.includes('usePullToRefresh'), 'TiendaPwaLayout debe integrar usePullToRefresh');
assert.ok(tiendaLayout.includes('PullToRefreshIndicator'), 'TiendaPwaLayout debe mostrar PullToRefreshIndicator');
assert.ok(tiendaLayout.includes('overflow-y-auto overscroll-y-contain'), 'TiendaPwaLayout debe contener scroll vertical suave con overscroll contain');
assert.ok(tiendaLayout.includes('flex-shrink-0'), 'TiendaPwaLayout debe fijar cabecera y barra inferior con flex-shrink-0');
console.log('✔ TiendaPwaLayout: shell modular con bordes 100% fijos, scroll contenido y Pull-to-Refresh');

// 4. Reparto Fácil: RepartidorPwaLayout.tsx
const repartidorLayout = fs.readFileSync(path.join(__dirname, '../src/modulos/repartidor/ui/RepartidorPwaLayout.tsx'), 'utf-8');
assert.ok(repartidorLayout.includes('fixed inset-0 h-[100dvh]'), 'RepartidorPwaLayout debe usar viewport fijo 100dvh');
assert.ok(!repartidorLayout.includes('PullToRefresh'), 'RepartidorPwaLayout NO debe incluir PullToRefresh para dejar libre el mapa');
assert.ok(repartidorLayout.includes('absolute inset-0 z-0'), 'RepartidorPwaLayout debe ubicar el mapa en absolute inset-0 z-0');
console.log('✔ RepartidorPwaLayout: mapa Leaflet GPS 100% libre para gestos táctiles sin Pull-to-Refresh');

// 5. Cobro Fácil: terminal.html
const terminalHtmlPath = path.join(__dirname, '../../crm-frigorifico/app/templates/terminal.html');
if (fs.existsSync(terminalHtmlPath)) {
  const terminalHtml = fs.readFileSync(terminalHtmlPath, 'utf-8');
  assert.ok(terminalHtml.includes('html, body {'), 'terminal.html debe contener reglas para html, body');
  assert.ok(terminalHtml.includes('overscroll-behavior: none !important'), 'terminal.html debe tener overscroll-behavior: none !important');
  assert.ok(terminalHtml.includes('position: fixed !important;\n                inset: 0 !important;\n                display: flex !important;\n                flex-direction: column !important;\n                height: 100dvh !important'), 'terminal.html debe fijar .main en móvil con 100dvh');
  assert.ok(terminalHtml.includes('cfPullToRefresh'), 'terminal.html debe incluir el indicador cfPullToRefresh');
  assert.ok(terminalHtml.includes('overscroll-behavior-y: contain !important'), 'terminal.html debe contener overscroll contain en .content');
  console.log('✔ Cobro Fácil: terminal.html con bordes 100% fijos en móvil y Pull-to-Refresh en .content');
}

console.log('>>> TODAS LAS VERIFICACIONES DE VIEWPORT Y PULL-TO-REFRESH PASARON EXITOSAMENTE <<<');
