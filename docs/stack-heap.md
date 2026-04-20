Pila y Montículo de memoria (Heap and Stack Memory)

Organización de lenguajes y compiladores 2

Aux. Oscar Estuardo de la Mora

Pila y Montículo de memoria (Stack memory, Heap Memory)

Las computadoras en lenguaje de bajo nivel deben trabajar en modo de pila al hacer llamadas a métodos. Por ejemplo si tenemos la siguiente estructura de
código:

void suma(){

//código

}
void main(){

//código
suma();

}

Si tenemos:

void resta(){

//código

}
void suma(){

//código
resta();

}
void main(){

//código
suma();
//código

}

El programa ejecutará primero el método main, y luego
el método suma, pero mientras el método suma esta
ejecutándose, el método main estará esperando.

El programa ejecutará primero el método
main, y luego el método suma, el método
main esta esperando, pero en el método
suma esta llamando al método resta,
entonces el método suma también
esperará la finalización del método resta.

Luego que el método resta termina,
regresa al método suma y cuando el
método suma termina regresará al método
main.

Pila y Montículo de memoria (Heap and Stack Memory)

Organización de lenguajes y compiladores 2

Aux. Oscar Estuardo de la Mora

Conforme se están llamando los métodos el tamaño de la pila de memoria (stack memory) crece, conforme a los requerimientos que el programa tenga, si
llamamos a un método recursivo por ejemplo:

void factorial(int num){
    if(i == 0)
           return;
   else
           factorial(num-1);
}
Este pedirá memoria hasta que se cumpla la condición, por ejemplo:

void main(){
       factorial(3);
}

Podemos ver en la gráfica que conforme se llaman métodos, se pide memoria para poder llamar al siguiente método factorial, mientras el otro se queda
esperando a que termine, podemos notar el comportamiento de pila.

El método main llama al método factorial enviándole un '3', luego este manda a llamar al método factorial enviándole un '2', luego este se vuelve a llamar
con un '1', y este manda a llamarse de nuevo con un '0', como en la condición del algoritmo dice que cuando sea '0' el número, que regrese entonces,
termina el método factorial(0), y se regresa al factorial(1), luego este termina y regresa al factorial(2), este termina y regresa a factorial(3), este termina y
regresa al método main de donde fue llamado originalmente.

Pila y Montículo de memoria (Heap and Stack Memory)

Organización de lenguajes y compiladores 2

Aux. Oscar Estuardo de la Mora

Si tenemos un código de esta forma:
void metodo4(){
     //código
     metodo5();
     //código
}
void método2(){
     //código
     metodo3();
     //código
}
void metodo1(){
     //código
     metodo2();
     //código
     metodo4();
}
void main(){
     //código
     metodo1();
     //código
     metodo6();
     //código
}

Primero se llama al método main(), luego este llama al metodo1(), luego este manda a llamar al metodo2(),  y este manda a llamar a metodo3(),
metodo3() termina y regresamos a metodo2(), metodo2() termina y regresamos a metodo1(), metodo1() manda a llamar a metodo4(),
metodo4() manda a llamar a metodo5(), luego metodo5() termina y regresamos a metodo4(), luego regresamos a metodo1() y metodo1()
termina, regresamos a main(), luego manda a llamar a metodo6(), metodo6() termina y luego regresamos al main().

Pila y Montículo de memoria (Heap and Stack Memory)

Organización de lenguajes y compiladores 2

Aux. Oscar Estuardo de la Mora

El Heap de memoria trabaja de forma distinta, este siempre va a crecer, En el Heap de memoria se guardan los objetos y arreglos que se declaran en un
programa, cuando queremos crear un objeto en el método donde esta declarado tenemos su instancia, su puntero o en otras palabras su dirección de
memoria es contenida en la instancia, y el objeto en si, esta en el Heap.

class Objeto{
     int a;
     int b;
}

public static void main(){
     Objeto obj1 = new Objeto();
     Objeto obj2 = new Objeto();
}

Por lo general el espacio de memoria del Heap va a ser mucho mayor que el del Stack
pues va a contener todos los objetos y arreglos. Como podemos ver el método main en el Stack va a tener cierto espacio que ocupan las instancias
declaradas en el, a este espacio se le llama ámbito del método. En el ámbito del método main() tenemos las direcciones de memoria de los objetos, también
podemos ver que los objetos ocupan un espacio en el Heap de memoria, por consiguiente, también tienen un ámbito en el cual existen. Si cada instancia y
cada entero ocupara una unidad de memoria, el tamaño del método main seria '2' y el tamaño del objeto en el Heap seria de tamaño '2'.

Si tuviéramos un código de esta forma:

public void masMemoria(){

Objeto obj1 = new Objeto();

}
public static void main(){

Objeto obj1 = new Objeto;
masMemoria();

}

Pila y Montículo de memoria (Heap and Stack Memory)

Organización de lenguajes y compiladores 2

Aux. Oscar Estuardo de la Mora

Podemos ver que el ámbito del método main() es de tamaño '1' y del método masMemoria() también es tamaño '1', y he aquí el porque pueden haber
nombres de variables repetidas entre los métodos, porque sus ámbitos son distintos, las declaraciones están separadas por los ámbitos, en este caso, uno
en el main() y otro en el método masMemoria(). Los objetos no son los mismos pues
están también con sus propios ámbitos y en distintos lugares en el Heap.

En lenguajes de programación orientada a objetos como Java se trabajan TODOS los
objetos y arreglos como referencia, es decir, TODAS las declaraciones de objetos y arreglos
son punteros.
Código en C/C++
Objeto * obj;
Es equivalente a decir en Java
Objeto obj;

El contenido de esta variable es una dirección de memoria.

Si tenemos este código
Objeto obj1 = new Objeto();
Objeto obj2 = new Objeto();
Objeto obj3;

Podemos ver que obj1 y obj2 esta apuntando en un lugar en el Heap. Este es un lugar donde el
objeto se esta alojando, para poder acceder al objeto usamos la referencia que tenemos en el
ámbito del método main. También podemos notar que obj3 no esta apuntando a ni un lugar, la
razón es porque no se uso el operador new para direccionar y reservar memoria para su
objeto. Ahora bien, que pasa si tenemos esta línea de código:

obj3 = obj2;

Como vemos en la gráfica, obj3 ahora esta apuntando hacia obj2 pues copió su dirección de memoria, ahora se puede acceder a obj2 por medio de obj3.

Pila y Montículo de memoria (Heap and Stack Memory)

Organización de lenguajes y compiladores 2

Aux. Oscar Estuardo de la Mora

Ahora bien, que pasa si tenemos el siguiente código

obj2 = obj1;

Ahora obj2 copio la dirección de memoria de obj1, ahora obj1 puede ser modificado
desde obj2, pero... ¿que paso con el objeto donde estaba apuntando obj2
anteriormente? Ahora solo puede ser accedido por obj3.

Pero que pasa si tenemos el siguiente código

obj3 = null;

Pero antes, que es null?
Null es un valor especial que especifica que una referencia esta apuntando a nada.

Pero... ¿que paso con el objeto a donde se estaba apuntando anteriormente?
Este objeto simplemente se perdió, y no puede ser accesado desde ni un lado del
programa, pues nadie esta apuntando hacia el. Pero, ¿que pasa con la memoria que
este ocupaba?, esta también se perdió y no se puede recuperar, esta marcada como
ocupada y no puede usarse para crear o colocar nuevos objetos.

A este fenómeno de pérdida de memoria se le llama Fuga de memoria o “Memory
Leak” en ingles, este problema se soluciona con una buena administración de
memoria por parte del programador si se hace manualmente, mediante métodos
constructores y destructores (que se verán mas adelante).

Ahora con los nuevos lenguajes de programación se implementa lo que se llama “Recolectores de basura” o “Garbage Collector” en ingles, lo que hace es
poner a disposición estos bloques perdidos o compactar la memoria para poder usarla mas tarde en el transcurso de la ejecución del programa.


