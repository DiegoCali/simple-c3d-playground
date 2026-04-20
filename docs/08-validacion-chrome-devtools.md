# Validacion con Chrome DevTools

Se realizaron pruebas manuales de regresion y nuevas capacidades en navegador, usando `chrome-devtools`.

## Entorno

- servidor local: `python3 -m http.server 8000`
- URL probada: `http://localhost:8000/`

## Caso 1: Ejemplo recursivo con `pila`, `pos` y `call`

Entrada: ejemplo cargado por defecto en `loadExample()`.

Se valida:

- parsea 49 instrucciones,
- soporta `proc`, `call`, `pila[...]`, `if ... then goto`,
- ejecuta recursion,
- renderiza grafo,
- actualiza tabla de stack.

Resultado observado:

- salida imprime `4` y `3`,
- estado final `pos = 0`,
- stack visible con 20 celdas,
- valor de referencia `pila[12] = 3` al final.

Interpretacion:

- la rama `L2` ejecuta `uno()` cuando termina recursion y muestra un valor referenciado (`4`),
- luego se imprime valor final referenciado (`3`).

## Caso 2: Regresion del ejemplo factorial clasico

Entrada:

```c3d
n = 5
result = 1
i = 1

Loop:
if i > n goto End
result = result * i
i = i + 1
goto Loop

End:
print result
end
```

Resultado observado:

- salida `120`,
- "Ejecucion completada",
- stack permanece en ceros, `pos = 0`.

Conclusión:

- compatibilidad retro conservada para programas previos sin pila.

## Caso 3: Validacion de rango de pila

Entrada:

```c3d
pos = 0
pila[20] = 1
end
```

Resultado observado:

- error: `Indice de pila fuera de rango: 20`.

Conclusión:

- validacion de limites funciona (`0..19`).

## Caso 4: Cierre de procedimiento con `}`

Entrada:

```c3d
proc uno {
print 1
}
call uno
end
```

Resultado observado:

- imprime `1`,
- llamada y retorno correctos.

Conclusión:

- cierre por llave mapeado correctamente a `endproc`.

## Caso 5: Ejecucion del ejemplo por defecto (solo llaves)

Se corrige el ejemplo base para usar exclusivamente `}` como cierre de procedimiento.

Resultado observado:

- salida `4` y `3`,
- `pos = 0` al final,
- stack conserva referencia actualizada en `pila[12] = 3`.

## Nota de consola

Se observo un warning de recurso 404 no critico (favicon), sin impacto funcional en la ejecucion del playground.
