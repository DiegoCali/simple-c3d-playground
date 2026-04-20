# Matriz de Discrepancias: Documentacion vs Comportamiento Real

## 1) Operadores logicos compuestos en una sola expresion

- **Documentacion dice**: se muestran ejemplos como `t4 = a > 0 && b > 0`.
- **Codigo hace**: parseo/evaluacion por busqueda lineal de primer operador; no hay AST para expresiones compuestas.
- **Impacto**: suele terminar en error de variable no definida (`"a > 0"` tratado como token).

Referencias:

- `docs.html:381`
- `src/Parser.js:174`
- `src/Interpreter.js:167`
- `src/Interpreter.js:146`

## 2) Validacion de labels antes de ejecutar

- **Documentacion dice**: labels se validan en fase previa.
- **Codigo hace**: la validacion de label inexistente ocurre al ejecutar `goto/if_goto`.
- **Impacto**: errores semanticos aparecen en runtime, no en parse global.

Referencias:

- `docs.html:756`
- `src/Interpreter.js:100`
- `src/Interpreter.js:113`

## 3) Unicidad de etiquetas

- **Documentacion dice**: cada etiqueta debe ser unica.
- **Codigo hace**: `Map.set` sobrescribe en silencio si label repetida.
- **Impacto**: comportamiento ambiguo en saltos y en CFG.

Referencias:

- `docs.html:421`
- `src/Parser.js:35`

## 4) `end` obligatoria

- **Documentacion dice**: `end` es obligatoria.
- **Codigo hace**: si no hay `end`, la ejecucion igual termina al llegar al fin de instrucciones.
- **Impacto**: discrepancia semantica con guias de uso.

Referencias:

- `docs.html:687`
- `src/Interpreter.js:27`

## 5) Comentarios inline en ejemplos

- **Estado**: resuelto parcialmente.
- **Documentacion dice**: se usan comentarios en ejemplos, incluyendo estilo inline.
- **Codigo hace**: ahora elimina comentarios inline simples con `//`, `#` y `/*` por linea.
- **Impacto actual**: mejora compatibilidad con C3D comentado; sigue siendo un stripping simple (sin parser completo de comentarios).

Referencias:

- `src/Parser.js:82`
- `src/Parser.js:95`

## 6) Estado final de ejecucion en UI

- **Estado**: resuelto.
- **Expectativa comun**: si hay error runtime, no deberia anunciarse ejecucion exitosa.
- **Codigo hace**: revisa `output` y muestra `Ejecucion terminada con errores` cuando corresponde.
- **Impacto actual**: UX coherente entre resultado y estado mostrado.

Referencias:

- `src/App.js:77`
- `src/App.js:78`
- `src/App.js:86`

## 7) Consistencia de sintaxis de labels

- **Documentacion dice**: labels como identificadores logicos del lenguaje.
- **Estado**: resuelto para destinos de salto.
- **Codigo hace**:
  - `goto` y `if ... goto` usan destino identificador (`[A-Za-z_]\w*`),
  - ambos aceptan el mismo formato de label target.
- **Impacto actual**: sintaxis consistente en saltos.

Referencias:

- `src/Parser.js:172`
- `src/Parser.js:178`

## Resumen para priorizacion

Discrepancias mas criticas para corregir primero:

1. expresiones compuestas,
2. validacion de labels duplicadas y faltantes en parse,
3. AST/precedencia real para evaluacion robusta,
4. mejorar semantica avanzada de procedimientos (returns con valor, heap, etc.).
