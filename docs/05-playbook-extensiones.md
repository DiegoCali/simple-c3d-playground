# Playbook de Extensiones (Para Continuar el Desarrollo)

Objetivo: guiar implementaciones futuras sin romper comportamiento base.

## 1) Donde tocar segun tipo de mejora

## 1.1 Nueva instruccion de lenguaje

Archivos:

1. `src/Parser.js`
   - reconocer sintaxis en `parseLine()`.
   - construir nodo de instruccion tipado.

2. `src/Interpreter.js`
   - agregar `case` en `executeInstruction()`.
   - implementar semantica con metodo dedicado.

3. `src/GraphBuilder.js`
   - representar instruccion en `instructionToString()`.

4. `docs/*.md`
   - actualizar especificacion real y discrepancias.

## 1.2 Nuevos operadores

Archivos:

1. `src/Parser.js`
   - incluir operador en `this.operators` (orden importa).

2. `src/Interpreter.js`
   - implementar operador en `applyOperator()`.

3. evaluar impacto en `evaluateCondition()`.

## 1.3 Mejorar expresiones (alta prioridad)

Recomendado:

- reemplazar parseo por `indexOf` con parser real de expresiones.
- crear AST minimo:
  - `LiteralNode`
  - `IdentifierNode`
  - `BinaryExpressionNode`
- evaluar AST en interpreter.

Impacto principal:

- `src/Parser.js`
- `src/Interpreter.js`

## 1.4 Mejorar CFG y grafo

Archivos:

- `src/BlockBuilder.js` (reglas de bloques/edges)
- `src/GraphBuilder.js` (formato Mermaid)

Mejoras tipicas:

- deduplicar edges,
- detectar codigo inalcanzable,
- clases de nodo por tipo (entry/exit/branch),
- evitar colisiones de IDs.

## 2) Estrategia de cambios segura

1. Agregar tests de reproduccion de edge-cases antes de refactor.
2. Hacer cambios incrementales por modulo.
3. Verificar que ejemplo de factorial siga funcionando.
4. Revisar que docs y comportamiento no diverjan.

## 3) Contratos actuales que no romper

- `Parser.parse(code)` retorna `{ instructions, labels }`.
- `Interpreter.run()` retorna `{ output, variables }`.
- `BasicBlocksBuilder.build()` retorna `blocks`.
- `BasicBlocksBuilder.getEdges()` retorna `edges`.
- `MermaidGraphBuilder.build()` retorna string Mermaid valido.

## 4) Quick wins recomendados

1. **Validar labels duplicadas en parse** (error temprano).
2. **Soporte comentarios inline** (`//`, `#` fuera de strings).
3. **Estado de ejecucion UI correcto** (no mostrar exito cuando hay error).
4. **Consistencia label targets** entre `goto` y `if ... goto`.

## 5) Roadmap tecnico sugerido

Fase 1 (bajo riesgo):

- validaciones semanticas tempranas,
- mensajes UX claros,
- limpieza de comentarios inline.

Fase 2 (medio riesgo):

- parser de expresiones con precedencia,
- evaluador AST,
- compatibilidad retro con ejemplos actuales.

Fase 3 (alto valor):

- analisis de alcanzabilidad,
- visualizacion enriquecida de CFG,
- reportes de warnings (codigo muerto, labels no usadas).
