# Guia Rapida para Agentes de Desarrollo

Este archivo sirve como referencia operativa para un agente que retoma el proyecto.

## 1) Preguntas frecuentes (FAQ)

## El proyecto necesita backend?

No. Es una app estatica de navegador con modulos ES.

## Se puede abrir `index.html` directo?

No recomendado. Usar servidor local por `type="module"`.

Referencia:

- `QUICKSTART.md:24`

## Donde esta la logica de ejecucion?

- parse: `src/Parser.js`
- runtime: `src/Interpreter.js`
- CFG: `src/BlockBuilder.js`
- Mermaid: `src/GraphBuilder.js`
- orquestacion UI: `src/App.js`

## Cual es el caso smoke test base?

El ejemplo de factorial cargado por `loadExample()`.

Referencia:

- `src/App.js:194`

## 2) Checklist antes de modificar

1. Leer `docs/02-especificacion-real-c3d.md`.
2. Revisar `docs/03-matriz-discrepancias.md` para evitar reforzar bugs conocidos.
3. Revisar `docs/04-riesgos-y-edge-cases.md` y elegir casos de regresion.
4. Definir si cambio afecta parser, runtime, CFG o solo UI.

## 3) Checklist despues de modificar

1. Ejecutar manualmente ejemplo factorial.
2. Probar al menos un caso con `goto` y uno con `if ... goto`.
3. Probar caso de error controlado (variable no definida o label inexistente).
4. Confirmar que grafo Mermaid renderiza.
5. Actualizar docs de esta carpeta si cambio altero comportamiento.

## 4) Dudas comunes y respuesta corta

## Por que falla `a > 0 && b > 0`?

Porque parser/evaluator actual no soporta expresiones compuestas con AST.

## Por que aparece "Ejecucion completada" con error?

Porque App imprime ese mensaje sin revisar si output contiene errores.

## Por que un `goto` a label rara funciona y `if goto` no?

Porque `if ... goto` valida target con `\w+`, pero `goto` no usa esa regex.

## 5) Convenciones recomendadas para nuevas contribuciones

- Mantener separacion por responsabilidades (parser/interpreter/block/graph/app).
- Evitar mezclar cambios de semantica con cambios de UI en el mismo commit.
- Incluir mini programas C3D de prueba cuando se agregue sintaxis.
- Mantener alineada la documentacion con el comportamiento real.

## 6) Fuente de verdad para semantica

En caso de conflicto entre docs narrativas y codigo:

- priorizar comportamiento actual del codigo,
- actualizar docs de este directorio,
- luego decidir si se corrige codigo o documentacion publica (`README.md`, `docs.html`).
