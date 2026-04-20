# Debugger Basico: Step + Run

Se implemento un modo de depuracion basico, sin breakpoints ni step-over, con foco en:

- ejecutar una instruccion a la vez (`Step`),
- ejecutar hasta terminar (`Ejecutar`),
- reiniciar sesion (`Reiniciar`).

## 1) Cambios de UI

Se agregaron controles:

- `Step`
- `Reiniciar`

Se agrego panel de estado en salida (`debugInfo`):

- `PC`
- `Iter`
- `Estado` (`RUNNABLE`/`HALT`)
- instruccion actual

Referencias:

- `index.html`
- `style.css`
- `src/App.js`

## 2) Cambios de runtime

En `C3DInterpreter`:

- `step()` ejecuta un unico paso y retorna snapshot.
- `run()` ahora itera sobre `step()` hasta halt.
- `isHalted()` indica estado terminal.
- `getResult()` expone metadatos de depuracion.

Campos nuevos en resultado:

- `pc`
- `iterations`
- `halted`
- `currentInstruction`
- `lastStep`

Referencia:

- `src/Interpreter.js`

## 3) Sesion en App

`App.js` ahora mantiene una sesion (`debugSession`) para no reconstruir interpreter en cada click.

- parsea y construye grafo una vez por sesion,
- consume salida incremental con `lastOutputIndex`,
- actualiza variables/stack/debug info en cada step.

## 4) Flujo de botones

- `Step`:
  - si no hay sesion, crea una nueva,
  - ejecuta una instruccion,
  - refresca paneles.

- `Ejecutar`:
  - si no hay sesion, crea una nueva,
  - ejecuta hasta terminar desde estado actual,
  - mantiene salida acumulada.

- `Reiniciar`:
  - reconstruye la sesion desde el codigo actual,
  - deja `PC = 0`, `Iter = 0`.

## 5) Validacion manual (chrome-devtools)

Se valido:

1. Step incremental en ejemplo recursivo:
   - `PC` e `Iter` avanzan,
   - estado refleja instruccion actual.

2. Run posterior a varios Step:
   - completa ejecucion restante,
   - salida final correcta (`4`, `3` en ejemplo por defecto).

3. Reiniciar:
   - restaura sesion limpia (`PC: 0`, `Iter: 0`).

4. Error en Step:
   - con `pila[20] = 1` muestra error,
   - estado cambia a `HALT` y no continua.
