# Especificacion Real de C3D (Implementacion Actual)

Este documento describe la **especificacion efectiva** del lenguaje segun el codigo actual, no segun la documentacion teorica.

## 1) Preprocesado de codigo

El parser preprocesa asi:

1. `split('\n')`
2. `trim()` por linea
3. elimina lineas vacias
4. elimina lineas que empiezan con `//` o `#`

Importante:

- No hay soporte de comentarios inline.
- Una linea como `x = 1 // foo` no se limpia y puede romper parseo/ejecucion.

Referencia:

- `src/Parser.js:71`

## 2) Deteccion de etiquetas

Una etiqueta es cualquier linea que termine con `:`.

- Deteccion: `line.endsWith(':')`
- Nombre: `line.slice(0, -1).trim()`

No hay validacion fuerte del identificador de label.

Referencia:

- `src/Parser.js:84`
- `src/Parser.js:93`

## 3) Instrucciones soportadas

## 3.1 `end`

- Sintaxis exacta: `end` (minusculas).
- Efecto: detiene ejecucion.

Referencia:

- `src/Parser.js:104`
- `src/Interpreter.js:64`

## 3.2 `print <token>`

- `token` puede ser numero o variable.
- Salida se agrega a `output` como texto.

Referencia:

- `src/Parser.js:109`
- `src/Interpreter.js:90`

## 3.3 `goto <target>`

- Salto incondicional.
- En runtime valida existencia de label destino.

Referencia:

- `src/Parser.js:114`
- `src/Interpreter.js:99`

## 3.4 `if <condition> goto <label>`

- Regex usada: `^if\s+(.+?)\s+goto\s+(\w+)$`
- El target debe cumplir `\w+`.

Referencia:

- `src/Parser.js:119`

## 3.5 Asignaciones

### Asignacion binaria

- Forma: `<var> = <left> <op> <right>`
- Operadores parseados (orden interno):
  - `>=`, `<=`, `==`, `!=`, `&&`, `||`, `>`, `<`, `+`, `-`, `*`, `/`

### Asignacion simple

- Forma: `<var> = <value>`

Referencia:

- `src/Parser.js:13`
- `src/Parser.js:174`
- `src/Parser.js:195`

## 4) Resolucion de valores

`getValue(token)` admite:

- numero literal parseable por `parseFloat`,
- variable existente en `Map`.

Si no es ninguno: error `Variable no definida`.

Referencia:

- `src/Interpreter.js:146`

## 5) Operadores ejecutables

Soportados en runtime (`applyOperator`):

- Aritmeticos: `+`, `-`, `*`, `/`
- Relacionales: `>`, `<`, `>=`, `<=`, `==`, `!=`
- Logicos: `&&`, `||`

Semantica de verdad:

- retorna `1` o `0` para comparaciones/logicos.
- division por cero lanza error.

Referencia:

- `src/Interpreter.js:196`

## 6) Condiciones en `if`

`evaluateCondition` intenta partir por operadores en este orden:

- `>=`, `<=`, `==`, `!=`, `&&`, `||`, `>`, `<`

Si no encuentra operador, evalua el token como verdad numerica (`!= 0`).

Referencia:

- `src/Interpreter.js:167`

## 7) Modelo de ejecucion

- `pc` inicia en `0`.
- Loop: mientras `pc < instructions.length` y `iterations < 100000`.
- Saltos (`goto`, `if_goto`) actualizan `pc = targetIndex - 1` para compensar `pc++` del loop.
- Error en instruccion se captura y se agrega al output.
- Si llega al limite, reporta posible bucle infinito.

Referencia:

- `src/Interpreter.js:15`
- `src/Interpreter.js:24`
- `src/Interpreter.js:103`
- `src/Interpreter.js:44`

## 8) Gramatica operativa aproximada (EBNF simplificada)

Esta EBNF refleja comportamiento actual, no lenguaje ideal:

```ebnf
program         := { line }
line            := label | instruction
label           := <any-text-ending-with-colon>
instruction     := end
                 | print
                 | goto
                 | if_goto
                 | assign

end             := "end"
print           := "print" ws token
goto            := "goto" ws target
if_goto         := "if" ws condition ws "goto" ws word_target
assign          := variable ws? "=" ws? expression

expression      := simple_value | binary_value
binary_value    := token ws operator ws token
simple_value    := token

token           := number | variable
variable        := /\w+/
word_target     := /\w+/
target          := /.+/   ; parser simple de substring en goto
operator        := ">=" | "<=" | "==" | "!=" | "&&" | "||"
                 | ">"  | "<"  | "+"  | "-"  | "*"  | "/"
```

## 9) Compatibilidad real esperada

Funciona bien para:

- programas lineales,
- bucles y saltos simples,
- comparaciones simples,
- asignaciones de 1 operador.

No es robusto para:

- expresiones compuestas,
- comentarios inline,
- ciertos labels con caracteres especiales en `if ... goto`.

## 10) Actualizacion runtime: pila y procedimientos

Desde la extension de entornos locales, tambien se soporta:

- `proc <id> {` y `procedure <id>(...) {`
- cierre por `}` o `endproc`
- `return`
- `call <id>`
- `pila[idx] = value` y `t = pila[idx]` (alias `stack`)
- `if ... then goto <L>` (ademas de `if ... goto <L>`)

Semantica:

- pila fija de 20 celdas,
- `pos`/`ptr` como base de entorno,
- `call` manual respecto a `pos` (el C3D hace `pos = pos +/- n`),
- validacion de rango para indices de pila (`0..19`).

Notas importantes:

- ahora hay limpieza de comentarios inline simples (`//`, `#`, `/*` por linea),
- expresiones compuestas complejas siguen limitadas (no hay AST completo).

Referencia ampliada:

- `docs/07-runtime-pila-y-entornos.md`
