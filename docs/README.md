# C3D Playground - Hallazgos Tecnicos para Desarrollo

Este directorio consolida la exploracion tecnica del repositorio para que un agente (o cualquier desarrollador) pueda:

- entender rapido como funciona la herramienta hoy,
- responder dudas de comportamiento real,
- priorizar mejoras,
- extender el lenguaje C3D con menor riesgo.

## Estructura

1. `docs/01-arquitectura-y-flujo.md`
   - arquitectura estatica de la app,
   - flujo end-to-end de parseo, ejecucion y grafo.

2. `docs/02-especificacion-real-c3d.md`
   - sintaxis realmente soportada por el codigo,
   - semantica efectiva del runtime,
   - gramatica operativa actual.

3. `docs/03-matriz-discrepancias.md`
   - diferencias entre documentacion (README/docs.html) y comportamiento real.

4. `docs/04-riesgos-y-edge-cases.md`
   - riesgos tecnicos,
   - casos limite,
   - snippets minimos para reproducir fallos.

5. `docs/05-playbook-extensiones.md`
   - guia practica para agregar funcionalidades,
   - puntos de cambio por archivo,
   - recomendaciones para refactor incremental.

6. `docs/06-guia-rapida-agente.md`
   - FAQ operativo para agentes,
   - checklist de analisis previo y validacion posterior.

7. `docs/07-runtime-pila-y-entornos.md`
   - semantica implementada para `pila`, `pos/ptr`, `call`, `proc`.

8. `docs/08-validacion-chrome-devtools.md`
   - pruebas funcionales ejecutadas en navegador,
   - resultados esperados/observados.

9. `docs/09-debugger-step-run.md`
   - diseno y comportamiento del debugger basico,
   - flujo Step/Run/Reiniciar.

## Alcance

Este material refleja el estado actual del codigo fuente en:

- `index.html`
- `src/App.js`
- `src/Parser.js`
- `src/Interpreter.js`
- `src/BlockBuilder.js`
- `src/GraphBuilder.js`
- `README.md`
- `docs.html`

## Nota

Cuando se hagan cambios funcionales en parser/interpreter/graph, actualizar al menos:

- `docs/02-especificacion-real-c3d.md`
- `docs/03-matriz-discrepancias.md`
- `docs/04-riesgos-y-edge-cases.md`
- `docs/07-runtime-pila-y-entornos.md`
