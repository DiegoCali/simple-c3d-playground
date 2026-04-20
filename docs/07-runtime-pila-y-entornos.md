# Runtime de Pila y Entornos Locales

Este documento define la semantica implementada para soporte de pila y llamadas.

## 1) Objetivo

Soportar modelo de entornos locales por activacion en C3D, con:

- pila fija de 20 celdas,
- variable base de entorno `pos` (alias `ptr`),
- llamadas `call` con retorno,
- paso por referencia a traves de direcciones en pila.

## 2) Estructuras del runtime

En `src/Interpreter.js`:

- `stackSize = 20`
- `stack = Array(20).fill(0)`
- `pos = 0`
- `callStack = []`
- `procedures = Map(name -> { start, endExclusive })`

Referencias:

- `src/Interpreter.js:19`
- `src/Interpreter.js:40`

## 3) Variables especiales

- `pos` y `ptr` son sinonimos.
- Al asignar `pos` o `ptr`, ambos se sincronizan.
- Al leer `pos` o `ptr`, se retorna el valor actual de base de entorno.

Referencias:

- `src/Interpreter.js:31`
- `src/Interpreter.js:398`
- `src/Interpreter.js:417`

## 4) Nuevas instrucciones soportadas

## 4.1 Procedimientos

- Inicio: `proc nombre {` o `procedure nombre (...) {`
- Cierre: `endproc` o `}`
- Retorno explicito: `return`

Parser:

- `proc_start`
- `endproc`
- `return`

Referencias:

- `src/Parser.js:139`
- `src/Parser.js:150`
- `src/Parser.js:155`

## 4.2 Llamadas

- `call nombre`

Semantica:

- guarda `returnPc` en `callStack`,
- salta al inicio del procedimiento,
- **no** modifica `pos` automaticamente (modo manual).

Referencia:

- `src/Interpreter.js:257`

## 4.3 Acceso a pila

- Escritura: `pila[idx] = valor` (o `stack[idx] = valor`)
- Lectura: `t = pila[idx]` (o `t = stack[idx]`)

Semantica:

- `idx` se evalua como expresion,
- debe ser entero y estar en rango `0..19`.

Referencias:

- `src/Parser.js:184`
- `src/Parser.js:190`
- `src/Interpreter.js:330`
- `src/Interpreter.js:378`

## 4.4 Condicional con `then`

Se soporta:

- `if cond goto L1`
- `if cond then goto L1`

Referencia:

- `src/Parser.js:178`

## 5) Politica de retorno

- `endproc` y `return` hacen retorno al `returnPc` guardado.
- Si `pc` sobrepasa el final de procedimiento activo, hay retorno automatico de seguridad.

Referencia:

- `src/Interpreter.js:140`
- `src/Interpreter.js:224`
- `src/Interpreter.js:236`

## 6) Comentarios inline

Para facilitar C3D con anotaciones teoricas, se eliminan inline:

- `//`
- `#`
- `/*`

Nota: es un stripping simple por linea.

Referencia:

- `src/Parser.js:95`

## 7) UI Stack

Se agrego panel visual de pila:

- tabla de 20 filas fijas,
- columnas `idx` y `valor`,
- resaltado de fila `pos`.

Referencias:

- `index.html:75`
- `src/App.js:166`
- `style.css:90`

## 8) Compatibilidad

Se mantiene:

- `Parser.parse()` retorna `{ instructions, labels }`.
- `Interpreter.run()` mantiene `output` y `variables`, y agrega `stack`, `pos`, `callDepth`.
- flujo de grafo sigue operativo, con visualizacion de nuevas instrucciones.
