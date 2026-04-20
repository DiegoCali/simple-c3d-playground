# Riesgos Tecnicos y Edge Cases

Este documento lista riesgos reales observados y mini casos para reproducirlos.

## 1) Parser sin AST para expresiones

### Riesgo

El parser separa por `indexOf` del primer operador encontrado segun una lista fija.

Consecuencia:

- no maneja bien expresiones encadenadas,
- no respeta precedencia real,
- no soporta parentesis.

Referencia:

- `src/Parser.js:174`

### Reproduccion minima

```c3d
a = 1
b = 2
c = 3
t1 = a + b * c
print t1
end
```

Esperado por usuario: `7`.
Comportamiento actual: parseo ambiguo/no esperado.

## 2) Condiciones compuestas en `if`

### Riesgo

`evaluateCondition` no resuelve expresiones booleanas compuestas robustamente.

Referencia:

- `src/Interpreter.js:167`

### Reproduccion minima

```c3d
a = 1
b = 1
if a > 0 && b > 0 goto OK
print 0
goto FIN
OK:
print 1
FIN:
end
```

Resultado esperado: `1`.
Posible resultado real: error de variable no definida.

## 3) Comentarios inline no soportados

### Riesgo

Solo se eliminan comentarios al inicio de linea.

Referencia:

- `src/Parser.js:76`

### Reproduccion minima

```c3d
x = 10 // valor inicial
print x
end
```

Comportamiento: puede fallar por token invalido en runtime.

## 4) Etiquetas duplicadas

### Riesgo

Si una etiqueta se repite, no hay error; el `Map` se sobrescribe.

Referencia:

- `src/Parser.js:35`

### Reproduccion minima

```c3d
L:
print 1
goto FIN

L:
print 2

FIN:
end
```

Comportamiento: ambiguo, depende del ultimo mapeo y de como se formen bloques.

## 5) Inconsistencia target de label (`goto` vs `if goto`)

### Riesgo

- `goto` parsea el target por substring libre.
- `if ... goto` exige `\w+`.

Referencia:

- `src/Parser.js:119`
- `src/Parser.js:148`

### Reproduccion minima

```c3d
Inicio-1:
print 1
goto Inicio-1
```

Este tipo de nombre puede pasar/fallar segun instruccion usada.

## 6) Mensaje de UI "Ejecucion completada" aun con error

### Riesgo

El interpreter reporta error en `output`, pero App no discrimina y muestra completado.

Referencia:

- `src/Interpreter.js:37`
- `src/App.js:86`

### Reproduccion minima

```c3d
print x
end
```

UI puede mostrar error y luego "Ejecucion completada".

## 7) Colision de IDs en Mermaid

### Riesgo

`sanitizeId` reemplaza caracteres no alfanumericos por `_`.

Dos labels distintas pueden colisionar:

- `A-B`
- `A B`

ambas => `A_B`

Referencia:

- `src/GraphBuilder.js:133`

## 8) Dependencia de CDN

### Riesgo

Sin internet o si CDN falla:

- no hay Bootstrap/Mermaid,
- se degrada experiencia o falla render de grafo.

Referencia:

- `index.html:9`
- `index.html:93`

## 9) Limite de iteraciones fijo

### Riesgo

`maxIterations = 100000` evita cuelgues, pero puede cortar ejecuciones validas largas.

Referencia:

- `src/Interpreter.js:17`

## Recomendaciones de mitigacion (prioridad)

1. Introducir parser de expresiones (Pratt o Shunting-yard) con AST.
2. Soportar comentarios inline de forma segura.
3. Validar labels duplicadas/faltantes en parse.
4. Ajustar estado final de ejecucion en UI (exito vs error).
5. Unificar politica de identificadores para labels.
6. Evitar colision de IDs Mermaid (hash o sufijos unicos).
