/**
 * App.js
 * 
 * Responsabilidad Única (S): Coordinar la aplicación y manejar interacciones del DOM.
 * 
 * Dependency Inversion (D): Depende de abstracciones (las clases importadas),
 * no de implementaciones concretas.
 */

import { C3DParser } from './Parser.js';
import { C3DInterpreter } from './Interpreter.js';
import { BasicBlocksBuilder } from './BlockBuilder.js';
import { MermaidGraphBuilder } from './GraphBuilder.js';

export class C3DPlaygroundApp {
    constructor() {
        this.initializeDOM();
        this.attachEventListeners();
        this.loadExample();
    }

    /**
     * Inicializa referencias a elementos del DOM
     */
    initializeDOM() {
        this.codeEditor = document.getElementById('codeEditor');
        this.outputDiv = document.getElementById('output');
        this.variablesDiv = document.getElementById('variablesDisplay');
        this.graphContainer = document.getElementById('graphContainer');
        this.runBtn = document.getElementById('runBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.exampleBtn = document.getElementById('exampleBtn');
    }

    /**
     * Adjunta event listeners a los botones
     */
    attachEventListeners() {
        this.runBtn.addEventListener('click', () => this.runCode());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        this.exampleBtn.addEventListener('click', () => this.loadExample());
    }

    /**
     * Ejecuta el código C3D completo
     */
    async runCode() {
        const code = this.codeEditor.value;
        this.clearOutput();

        if (!code.trim()) {
            this.displayOutput('error', 'No hay código para ejecutar');
            return;
        }

        try {
            // 1. Parse
            this.displayOutput('info', 'Analizando código...');
            const parser = new C3DParser();
            const { instructions, labels } = parser.parse(code);

            this.displayOutput('success', `Instrucciones parseadas: ${instructions.length}`);
            this.displayOutput('success', `Etiquetas encontradas: ${labels.size}`);
            this.displayOutput('info', '');

            // 2. Build blocks
            const blockBuilder = new BasicBlocksBuilder(instructions);
            const blocks = blockBuilder.build();
            const edges = blockBuilder.getEdges();

            this.displayOutput('success', `Bloques básicos identificados: ${blocks.length}`);
            this.displayOutput('info', '');

            // 3. Execute
            this.displayOutput('info', 'Ejecutando...');
            const interpreter = new C3DInterpreter(instructions, labels);
            const { output, variables } = interpreter.run();

            this.displayOutput('info', '');
            this.displayOutput('info', 'Salida:');
            output.forEach(item => {
                this.displayOutput(item.type, item.message);
            });

            this.displayOutput('info', '');
            this.displayOutput('success', 'Ejecución completada');

            // 4. Display variables
            this.displayVariables(variables);

            // 5. Generate graph
            this.displayOutput('info', '');
            this.displayOutput('info', 'Generando grafo...');
            
            if (blocks.length > 0) {
                await this.renderGraph(blocks, edges);
                this.displayOutput('success', 'Grafo generado');
            } else {
                this.displayOutput('info', 'No hay bloques para visualizar');
            }

        } catch (error) {
            this.displayOutput('error', `Error: ${error.message}`);
            console.error(error);
        }
    }

    /**
     * Renderiza el grafo usando Mermaid
     * @param {Array} blocks
     * @param {Array} edges
     */
    async renderGraph(blocks, edges) {
        const graphBuilder = new MermaidGraphBuilder(blocks, edges);
        const mermaidCode = graphBuilder.build();

        // Limpiar contenedor
        this.graphContainer.innerHTML = '';

        // Crear elemento para Mermaid
        const graphDiv = document.createElement('div');
        graphDiv.className = 'mermaid';
        graphDiv.textContent = mermaidCode;
        this.graphContainer.appendChild(graphDiv);

        // Renderizar con Mermaid
        try {
            // Eliminar cualquier SVG previo y reinicializar
            const { svg } = await mermaid.render('graphDiagram', mermaidCode);
            this.graphContainer.innerHTML = svg;
        } catch (error) {
            console.error('Error al renderizar Mermaid:', error);
            this.displayOutput('error', 'Error al generar el diagrama');
            // Mostrar el código Mermaid como fallback
            graphDiv.style.whiteSpace = 'pre';
            graphDiv.style.fontFamily = 'monospace';
            graphDiv.style.fontSize = '12px';
        }
    }

    /**
     * Muestra una línea en el panel de salida
     * @param {string} type - Tipo de mensaje (info, success, error, print)
     * @param {string} message - Mensaje a mostrar
     */
    displayOutput(type, message) {
        const line = document.createElement('div');
        line.className = `output-line output-${type}`;
        line.textContent = message;
        this.outputDiv.appendChild(line);
        this.outputDiv.scrollTop = this.outputDiv.scrollHeight;
    }

    /**
     * Limpia el panel de salida
     */
    clearOutput() {
        this.outputDiv.innerHTML = '';
        this.variablesDiv.innerHTML = '';
    }

    /**
     * Muestra las variables en el panel
     * @param {Map} variables
     */
    displayVariables(variables) {
        if (variables.size === 0) {
            this.variablesDiv.innerHTML = '<div style="color: #6c757d;">No hay variables definidas</div>';
            return;
        }

        this.variablesDiv.innerHTML = '<div style="font-weight: bold; margin-bottom: 8px; color: #495057;">Variables:</div>';

        variables.forEach((value, name) => {
            const item = document.createElement('div');
            item.className = 'variable-item';
            item.innerHTML = `<span class="variable-name">${name}</span> = <span class="variable-value">${value}</span>`;
            this.variablesDiv.appendChild(item);
        });
    }

    /**
     * Limpia todo el playground
     */
    clearAll() {
        this.codeEditor.value = '';
        this.clearOutput();
        this.graphContainer.innerHTML = '';
    }

    /**
     * Carga un ejemplo de código C3D
     */
    loadExample() {
        const example = `// Ejemplo: Cálculo de factorial iterativo
// Calcula el factorial de 5

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
end`;

        this.codeEditor.value = example;
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new C3DPlaygroundApp();
});
