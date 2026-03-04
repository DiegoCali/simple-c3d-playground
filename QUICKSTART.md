# Inicio Rápido - C3D Playground

## 🚀 Cómo ejecutar

### Opción 1: Servidor Python
```bash
python3 -m http.server 8000
```
Luego abrir: http://localhost:8000

### Opción 2: Servidor Node/npx
```bash
npx serve .
```
Luego abrir la URL que muestra en consola.

### Opción 3: Live Server (VS Code)
1. Instalar extensión "Live Server"
2. Clic derecho en `index.html`
3. Seleccionar "Open with Live Server"

## ⚠️ Importante

**DEBE ejecutarse desde un servidor local** debido a que usa módulos ES6 (`type="module"`).

No funcionará simplemente abriendo `index.html` directamente en el navegador por restricciones CORS.

## ✅ Verificar que funciona

1. Al cargar la página, debe aparecer un ejemplo precargado
2. Hacer clic en "Ejecutar"
3. Debe verse:
   - Salida con mensajes de éxito
   - Variables mostradas
   - Grafo Mermaid con bloques básicos

## 🐛 Troubleshooting

Si no se ve el grafo:
- Verificar consola del navegador (F12)
- Asegurarse de que Mermaid CDN carga correctamente
- Verificar que no hay errores de módulos ES6

Si hay error de CORS:
- Asegurarse de usar un servidor local (no abrir archivo directamente)
