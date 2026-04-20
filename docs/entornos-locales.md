Métodos

Organización de lenguajes y compiladores 2

Aux. Oscar Estuardo de la Mora

Métodos (Funciones y Procedimientos)

Los procedimientos y funciones son subrutinas que permiten resolver una tarea específica, la diferencia entre estos dos es que las funciones retornan
valores. En programación orientada a objetos se le llaman específicamente métodos. Sobre este paradigma los métodos estan asociados a una clase
(métodos de clase o estáticos) o a un objeto (métodos de instancia).

Un método esta compuesto por varias partes:

  Nombre único en su ámbito (con excepción cuando

tenemos sobrecarga de métodos)

  Tipo de dato de retorno (si es que retorna algo)

Lista de parámetros (que diferencian métodos cuando
usamos sobrecarga de métodos)

  Código ejecutable (algoritmo del método)

Podemos agregar otros atributos como:

  Acceso (publico, privado o protegido)
  Estático
  entre otros

Los métodos almacenan sus variables en el Stack de memoria y tienen un comportamiento de pila. Un método también tiene un tamaño específico y esta
definido por la cantidad de variables dentro de el. La suma del tamaño de cada variable es el tamaño del método en el Stack.

Métodos

Organización de lenguajes y compiladores 2

Aux. Oscar Estuardo de la Mora

Suponiendo de que un entero es de tamaño de una celda de memoria

public static void main(){

int a;
int b;
int c;

}

Como el método main es el primero que se ejecuta, es el primero que es colocado en el Stack.

Podemos ver en la figura que el método main tiene sus tres variables en la memoria Stack, a esto
se le llama ámbito del método, osea que ese segmento  de memoria le pertenece exclusivamente al método main, y si otro método que fuera llamado
ocupara ese espacio, corrompería los datos, provocando error en el programa. Si
un método:

llamáramos a

public static void metodo1(){

int a;
int b;

}

public static void main(){

int a;
int b;
metodo1();
int c;

}

Métodos

Organización de lenguajes y compiladores 2

Aux. Oscar Estuardo de la Mora

Ahora cuando el método main esta llamando a metodo1() a este se le asigna un nuevo ámbito arriba del método del main, para que no se toquen sus
variables. Si llamáramos a otro método desde metodo1():

public static void metodo2(){

int z;

}
public static void metodo1(){

int a;
int b;

}
public static void main(){

int a;
int b;
metodo1();
int c;

}

Ahora tenemos que metodo2() tiene su
propio ámbito, separado de los demás
métodos. Cuando termina metodo2() de
ejecutarse, se regresa al ámbito anterior y
así sucesivamente.

Y que pasa con los parámetros??
Cuando se llama un método se preparan los parámetros en el Stack de memoria, que quiere decir? Supongamos esto:

public static void procesar(int x, int y){

z = y + x;
print(z);

}

Métodos

Organización de lenguajes y compiladores 2

Aux. Oscar Estuardo de la Mora

public static void main(){

int a = 5, b = 9;
procesar(b, a);

}

Podemos ver que nos quedamos antes de llamar al método, se asignaron valores a las
posiciones de memoria de las variables en el método main, ahora, lo siguiente es
preparar las variables en el ámbito de procesar(int, int), como son variables simples lo
que hacemos es pasar los valores por valor, osea, copiamos el valor de las variables en
el ámbito nuevo.

Ahora después de pasar los parámetros nos trasladamos al nuevo ámbito y se ejecutan
las instrucciones que están en el método.

Pero, como diferenciamos los ámbitos de cada método?? Vamos a tener una variable
especial que nos dará la posición relativa de los métodos. En nuestra tabla de símbolos
tenemos que las posiciones de las variables siempre comienzan con cero, pero cuando
estamos en la pila, podemos ver en el caso del método procesar(int, int), que la
variable 'x' esta en la posición 2 de la pila y no en cero como la variable 'a' del método
main.

Pero, respecto el método procesar(int, int) esta en la posición cero

Métodos

Organización de lenguajes y compiladores 2

Aux. Oscar Estuardo de la Mora

A nuestra variable de ámbito le llamaremos ptr y guardara el valor de donde comienza el método, así cuando tengamos que alcanzar una variable, solo
tenemos que sumar su posición en nuestra tabla de símbolos, la tabla de símbolos del método procesar(int, int) es la siguiente:

Nombre

Tipo
procesar(int, int)  void
x
y
z

int
int
int

Ámbito

Rol
Método

Posición  Tamaño

procesar(int, int)  Variable local
procesar(int, int)  Variable local
procesar(int, int)  Variable local

0
1
2

3
1
1
1

Para alcanzar la variable 'y', usamos a ptr, que en este momento tendria el valor de '2' en código 3Dir quedaria:

t1 = ptr + 1;
t2 = stack[t1];

Ese '1' lo obtenemos de nuestra tabla de símbolos, entonces al sumar, 't1' tendría un valor de '3' y como
podemos ver en la dirección absoluta. Ahora podemos obtener o colocar un valor en esa posición de
memoria, En este caso lo obtendremos.

Métodos

Organización de lenguajes y compiladores 2

Aux. Oscar Estuardo de la Mora

t3 = ptr + 0;
t4 = stack[t3];

t5 = t2 + t4;

t6 = ptr + 2;
stack[t6] = t5

Ahora en estas líneas obtendremos el valor de 'x' para posteriormente hacer la suma y almacenarla en la
dirección de memoria de 'z'.

Hacemos la suma correspondiente y luego almacenamos en la variable 'z'.

Obtenemos primero donde esta 'z' en el Stack de memoria.
Y por ultimo almacenamos la suma en esa dirección.

Ahora que termina el método, ptr regresa tantas posiciones como el tamaño del método que llamo a procesar(int, int), en este caso el método main() que
es de tamaño 2.

¿Pero que pasa con las variables del método anterior? Simplemente son descartadas, una vez que el método termina, carecen de significado.

Métodos

Organización de lenguajes y compiladores 2

Aux. Oscar Estuardo de la Mora

Si llamáramos a un método
nuevo, reescribira los datos que
están en el Stack de memoria,
pero eso no importa pues esos
valores ya no los necesitamos.

¿Como preparamos las variables en tres direcciones?

Pasaremos los valores del main() hasta procesar(int, int). Usaremos la tabla de símbolos y la variable ptr para poder hacer esto. La tabla de símbolos del
método main() quedaría de la siguiente forma:

Nombre  Tipo  Ámbito
void
main()
int
a
int
b

Método
main()  Variable Local  0
main()  Variable Local  1

2
1
1

Rol

Posición  Tamaño

t1 = ptr + 1;
t2 = stack[t1];
t3 = ptr + 2;
t4 = t3 + 0;
stack[t4] = t2;

Primero necesitamos obtener la dirección de 'b'.
Ahora obtenemos el valor de 'b' en la dirección que tenemos en 't1'.
Ahora vamos a desplazarnos fuera del main SIN cambiar ptr, cambiarlo antes de tiempo produciría un error fatal.
Ahora nos desplazamos en el ámbito nuevo hacia la posición que le corresponde al parámetro.
Ahora almacenamos el valor en el Stack en el ámbito nuevo.

Métodos

Organización de lenguajes y compiladores 2

Aux. Oscar Estuardo de la Mora

Lo mismo para pasar el otro parámetro:

t5 = ptr + 0;
t6 = stack[t5];
t7 = ptr + 2;
t8 = t7 + 1;
stack[t8] = t6;

Primero necesitamos obtener la dirección de 'a'.
Ahora obtenemos el valor de 'a' en la dirección que tenemos en 't6'.
Nos desplazarnos fuera del main, podemos ver que ese '2' lo obtenemos de la tabla de símbolos.
Ahora nos desplazamos en el ámbito nuevo hacia la posición que le corresponde al parámetro, en este caso '+1'.
Y por ultimo almacenamos el valor en el Stack en el ámbito nuevo.

Ahora que terminamos de preparar las variables, nos cambiamos de ámbito para saltar hacia procesar(int, int).

ptr = ptr + 2;
procesar();
ptr = ptr – 2;

Ahora si cambiamos el valor de ptr, para poder obtener una posición relativa, respecto procesar(int, int) y por ultimo
lo llamamos.
Cuando termina el método, regresamos al ámbito del método main(). Como podemos ver el '2' que sumamos y
restamos para cambiar de ámbito lo obtenemos de la tabla de símbolos.

Que pasa si es un método que regresa valores, cambiaremos un poco el código:

public static int procesar(int x, int y){

z = y + x;
return z;

}

public static void main(){

int a = 5, b = 9;
int resultado = procesar(b, a);

}

Métodos

Organización de lenguajes y compiladores 2

Aux. Oscar Estuardo de la Mora

Nombre

Tipo
procesar(int, int)  void
x
y
z
return

int
int
int
int

Ámbito

Rol
Método

Posición  Tamaño

procesar(int, int)  Variable local
procesar(int, int)  Variable local
procesar(int, int)  Variable local
procesar(int, int)  Variable local

0
1
2
3

4
1
1
1
1

Cuando tenemos un método que retorna valores,
tendremos en nuestra tabla de símbolos una variable
extra, y le corresponde al return, este SIEMPRE estará al
final del ámbito del método, y es considerada una variable
local del mismo.

Después de ejecutar el método y
termina regresamos al ámbito de
main(). Pero necesitamos el valor
que esta todavía en el ámbito de
procesar(int, int), el procedimiento
para poder obtener dicho valor es el
siguiente:


