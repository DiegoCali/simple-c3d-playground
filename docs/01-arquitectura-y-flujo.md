# Arquitectura y Flujo End-to-End

## 1) Vision general

El proyecto es una aplicacion **100% estatica** (cliente) para ejecutar e inspeccionar codigo C3D en navegador.

- No hay backend.
- No hay bundler ni dependencias npm locales.
- Se apoya en CDNs para UI (Bootstrap) y visualizacion de grafos (Mermaid).

Archivos raiz principales:

- `index.html`: pagina principal del playground.
- `docs.html`: documentacion del lenguaje.
- `style.css`: estilos UI.
- `src/*.js`: logica modular del parser/interpreter/grafo/app.

## 2) Bootstrap de la pagina estatica

Puntos tecnicos clave:

- `index.html` carga Bootstrap CSS/JS por CDN.
- `index.html` carga Mermaid como modulo ESM desde CDN y lo expone en `window.mermaid`.
- `index.html` carga `src/App.js` como `type="module"`.

Referencias:

- `index.html:9` (Bootstrap CSS)
- `index.html:89` (Bootstrap JS)
- `index.html:93` (import Mermaid ESM)
- `index.html:103` (`window.mermaid = mermaid`)
- `index.html:107` (entrypoint de app)

## 3) Componentes y responsabilidades

### `src/App.js`

Responsable de orquestacion UI + pipeline de analisis/ejecucion/grafo.

- Lee codigo del editor.
- Ejecuta parser.
- Construye bloques y edges.
- Ejecuta interpreter.
- Renderiza resultados y Mermaid.

Referencia:

- `src/App.js:47` (`runCode()`)

### `src/Parser.js`

Convierte texto C3D en:

- `instructions`: arreglo de instrucciones estructuradas.
- `labels`: `Map<label, instructionIndex>`.

Hace 2 pasadas:

1. Identifica labels y calcula indice de instruccion.
2. Genera instrucciones con metadatos (`label`, `index`).

Referencia:

- `src/Parser.js:21` (`parse()`)

### `src/Interpreter.js`

Ejecuta instrucciones parseadas con:

- `pc` (program counter),
- `variables` (`Map`),
- `output` (lista de mensajes),
- limite de iteraciones para cortar bucles infinitos.

Referencia:

- `src/Interpreter.js:24` (`run()`)

### `src/BlockBuilder.js`

Construye bloques basicos y aristas de flujo de control (CFG) a partir de instrucciones.

Referencia:

- `src/BlockBuilder.js:22` (`build()`)
- `src/BlockBuilder.js:102` (`getEdges()`)

### `src/GraphBuilder.js`

Convierte bloques + edges a sintaxis Mermaid (`graph TD`).

Referencia:

- `src/GraphBuilder.js:19` (`build()`)

## 4) Flujo de ejecucion detallado

Al presionar **Ejecutar**:

1. `App.runCode()` valida editor no vacio.
2. `Parser.parse(code)` retorna `{ instructions, labels }`.
3. `BasicBlocksBuilder.build()` arma bloques.
4. `BasicBlocksBuilder.getEdges()` arma conexiones CFG.
5. `Interpreter.run()` ejecuta y retorna `{ output, variables }`.
6. UI imprime salida y tabla de variables.
7. `MermaidGraphBuilder.build()` genera string Mermaid.
8. `mermaid.render()` devuelve SVG y se inyecta en el contenedor.

Referencia integral:

- `src/App.js:57`
- `src/App.js:67`
- `src/App.js:76`
- `src/App.js:89`
- `src/App.js:114`
- `src/App.js:129`

## 5) Modelo de datos interno

### Instruccion parseada (ejemplos)

- `assign`:
  - `{ type: 'assign', variable, left, operator, right, label, index }`
- `assign_simple`:
  - `{ type: 'assign_simple', variable, value, label, index }`
- `if_goto`:
  - `{ type: 'if_goto', condition, target, label, index }`
- `goto`:
  - `{ type: 'goto', target, label, index }`
- `print`:
  - `{ type: 'print', value, label, index }`
- `end`:
  - `{ type: 'end', label, index }`

### Bloque basico

Objeto con:

- `label`
- `instructions`
- `startIndex`
- `endIndex`

Referencia:

- `src/BlockBuilder.js:68`

### Edge CFG

Objeto con:

- `from`
- `to`
- `type`
- `conditional`
- `label` opcional (`true`/`false`)

Referencia:

- `src/BlockBuilder.js:115`

## 6) Dependencias externas (runtime)

- Bootstrap 5.3.0 CDN
- Mermaid 10 CDN (ESM)

Implicaciones:

- Requiere conexion a internet para funcionar tal como esta.
- Si cae el CDN de Mermaid, no se renderiza grafo.

## 7) Limitaciones de arquitectura estatica actual

- Sin build/test pipeline automatizado.
- Sin validacion formal de gramatica (parser regex/simple split).
- Sin persistencia de programas.
- Sin capas de test unitario/integracion para parser/interpreter.

Estas limitaciones son aceptables para prototipo educativo, pero importantes para evolucionar a herramienta robusta.
