/**
 * App.js
 *
 * Responsabilidad Única (S): Coordinar la aplicación y manejar interacciones del DOM.
 */

import { C3DParser } from './Parser.js';
import { C3DInterpreter } from './Interpreter.js';
import { BasicBlocksBuilder } from './BlockBuilder.js';
import { MermaidGraphBuilder } from './GraphBuilder.js';

export class C3DPlaygroundApp {
    constructor() {
        this.debugSession = null;
        this.lastOutputIndex = 0;

        this.initializeDOM();
        this.attachEventListeners();
        this.loadExample();
    }

    initializeDOM() {
        this.codeEditor = document.getElementById('codeEditor');
        this.outputDiv = document.getElementById('output');
        this.variablesDiv = document.getElementById('variablesDisplay');
        this.stackDiv = document.getElementById('stackDisplay');
        this.stackPointerLabel = document.getElementById('stackPointerLabel');
        this.graphContainer = document.getElementById('graphContainer');
        this.debugInfoDiv = document.getElementById('debugInfo');

        this.runBtn = document.getElementById('runBtn');
        this.stepBtn = document.getElementById('stepBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.exampleBtn = document.getElementById('exampleBtn');
    }

    attachEventListeners() {
        this.runBtn.addEventListener('click', () => this.runCode());
        this.stepBtn.addEventListener('click', () => this.stepCode());
        this.resetBtn.addEventListener('click', () => this.resetExecution());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        this.exampleBtn.addEventListener('click', () => this.loadExample());
    }

    async runCode() {
        try {
            const ready = await this.ensureSession();
            if (!ready) {
                return;
            }

            const interpreter = this.debugSession.interpreter;
            if (interpreter.isHalted()) {
                this.displayOutput('info', 'La ejecución ya terminó. Usa Reiniciar para iniciar una nueva sesión.');
                return;
            }

            this.displayOutput('info', 'Ejecutando hasta completar...');
            const result = interpreter.run();
            this.consumeNewOutput(result.output);
            this.updateRuntimePanels(result);
            this.updateDebugInfo(result);
            this.finalizeExecutionStatus(result);
        } catch (error) {
            this.displayOutput('error', `Error: ${error.message}`);
            console.error(error);
        }
    }

    async stepCode() {
        try {
            const ready = await this.ensureSession();
            if (!ready) {
                return;
            }

            const interpreter = this.debugSession.interpreter;
            if (interpreter.isHalted()) {
                this.displayOutput('info', 'La ejecución ya terminó. Usa Reiniciar para iniciar una nueva sesión.');
                return;
            }

            const result = interpreter.step();
            this.consumeNewOutput(result.output);
            this.updateRuntimePanels(result);
            this.updateDebugInfo(result);
            this.finalizeExecutionStatus(result);
        } catch (error) {
            this.displayOutput('error', `Error: ${error.message}`);
            console.error(error);
        }
    }

    async resetExecution() {
        try {
            await this.ensureSession({ forceReset: true });
            this.displayOutput('info', 'Sesión reiniciada.');
        } catch (error) {
            this.displayOutput('error', `Error: ${error.message}`);
            console.error(error);
        }
    }

    async ensureSession({ forceReset = false } = {}) {
        const code = this.codeEditor.value;

        if (!code.trim()) {
            this.clearOutput();
            this.displayOutput('error', 'No hay código para ejecutar');
            this.updateDebugInfo(null);
            return false;
        }

        if (!forceReset && this.debugSession && this.debugSession.sourceCode === code) {
            return true;
        }

        await this.createSession(code);
        return true;
    }

    async createSession(code) {
        this.resetSessionState();
        this.clearOutput();

        this.displayOutput('info', 'Analizando código...');
        const parser = new C3DParser();
        const { instructions, labels } = parser.parse(code);

        this.displayOutput('success', `Instrucciones parseadas: ${instructions.length}`);
        this.displayOutput('success', `Etiquetas encontradas: ${labels.size}`);
        this.displayOutput('info', '');

        const blockBuilder = new BasicBlocksBuilder(instructions);
        const blocks = blockBuilder.build();
        const edges = blockBuilder.getEdges();

        this.displayOutput('success', `Bloques básicos identificados: ${blocks.length}`);
        this.displayOutput('info', '');
        this.displayOutput('info', 'Salida:');

        const interpreter = new C3DInterpreter(instructions, labels);
        this.debugSession = {
            sourceCode: code,
            instructions,
            labels,
            blocks,
            edges,
            interpreter,
            statusShown: false
        };

        this.lastOutputIndex = 0;
        const initialResult = interpreter.getResult();
        this.updateRuntimePanels(initialResult);
        this.updateDebugInfo(initialResult);

        this.displayOutput('info', '');
        this.displayOutput('info', 'Generando grafo...');

        if (blocks.length > 0) {
            await this.renderGraph(blocks, edges);
            this.displayOutput('success', 'Grafo generado');
        } else {
            this.displayOutput('info', 'No hay bloques para visualizar');
        }
    }

    resetSessionState() {
        this.debugSession = null;
        this.lastOutputIndex = 0;
    }

    consumeNewOutput(output) {
        for (let i = this.lastOutputIndex; i < output.length; i++) {
            const item = output[i];
            this.displayOutput(item.type, item.message);
        }
        this.lastOutputIndex = output.length;
    }

    finalizeExecutionStatus(result) {
        if (!this.debugSession || !result.halted || this.debugSession.statusShown) {
            return;
        }

        this.displayOutput('info', '');
        const hasErrors = result.output.some(item => item.type === 'error');
        if (hasErrors) {
            this.displayOutput('error', 'Ejecución terminada con errores');
        } else {
            this.displayOutput('success', 'Ejecución completada');
        }

        this.debugSession.statusShown = true;
    }

    updateRuntimePanels(result) {
        this.displayVariables(result.variables);
        this.displayStack(result.stack, result.pos);
    }

    updateDebugInfo(result) {
        if (!result) {
            this.debugInfoDiv.textContent = '';
            return;
        }

        const status = result.halted ? 'HALT' : 'RUNNABLE';
        const instructionText = result.currentInstruction
            ? this.instructionToString(result.currentInstruction)
            : 'N/A';

        this.debugInfoDiv.textContent = `PC: ${result.pc} | Iter: ${result.iterations} | Estado: ${status} | Instr: ${instructionText}`;
    }

    instructionToString(instr) {
        switch (instr.type) {
            case 'assign':
                return `${instr.variable} = ${instr.left} ${instr.operator} ${instr.right}`;
            case 'assign_simple':
                return `${instr.variable} = ${instr.value}`;
            case 'stack_store':
                return `pila[${instr.stackIndex}] = ${instr.value}`;
            case 'stack_load':
                return `${instr.variable} = pila[${instr.stackIndex}]`;
            case 'print':
                return `print ${instr.value}`;
            case 'goto':
                return `goto ${instr.target}`;
            case 'if_goto':
                return `if ${instr.condition} goto ${instr.target}`;
            case 'call':
                return `call ${instr.target}`;
            case 'proc_start':
                return `proc ${instr.name}`;
            case 'endproc':
                return 'endproc';
            case 'return':
                return 'return';
            case 'end':
                return 'end';
            default:
                return instr.type || 'unknown';
        }
    }

    async renderGraph(blocks, edges) {
        const graphBuilder = new MermaidGraphBuilder(blocks, edges);
        const mermaidCode = graphBuilder.build();

        this.graphContainer.innerHTML = '';

        const graphDiv = document.createElement('div');
        graphDiv.className = 'mermaid';
        graphDiv.textContent = mermaidCode;
        this.graphContainer.appendChild(graphDiv);

        try {
            const { svg } = await mermaid.render('graphDiagram', mermaidCode);
            this.graphContainer.innerHTML = svg;
        } catch (error) {
            console.error('Error al renderizar Mermaid:', error);
            this.displayOutput('error', 'Error al generar el diagrama');
            graphDiv.style.whiteSpace = 'pre';
            graphDiv.style.fontFamily = 'monospace';
            graphDiv.style.fontSize = '12px';
        }
    }

    displayOutput(type, message) {
        const line = document.createElement('div');
        line.className = `output-line output-${type}`;
        line.textContent = message;
        this.outputDiv.appendChild(line);
        this.outputDiv.scrollTop = this.outputDiv.scrollHeight;
    }

    clearOutput() {
        this.outputDiv.innerHTML = '';
        this.variablesDiv.innerHTML = '';
        this.stackDiv.innerHTML = '';
        this.debugInfoDiv.textContent = '';
        this.stackPointerLabel.textContent = 'pos = 0';
    }

    displayVariables(variables) {
        if (!variables || variables.size === 0) {
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

    displayStack(stack, pos) {
        const size = 20;
        const safeStack = Array.isArray(stack) ? stack.slice(0, size) : new Array(size).fill(0);
        while (safeStack.length < size) {
            safeStack.push(0);
        }

        this.stackPointerLabel.textContent = `pos = ${pos ?? 0}`;

        const table = document.createElement('table');
        table.className = 'stack-table';

        const thead = document.createElement('thead');
        thead.innerHTML = '<tr><th>idx</th><th>valor</th></tr>';
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        safeStack.forEach((value, index) => {
            const row = document.createElement('tr');
            if (index === Math.trunc(pos)) {
                row.className = 'stack-row-active';
            }
            row.innerHTML = `<td>${index}</td><td>${value}</td>`;
            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        this.stackDiv.innerHTML = '';
        this.stackDiv.appendChild(table);
    }

    clearAll() {
        this.codeEditor.value = '';
        this.resetSessionState();
        this.clearOutput();
        this.graphContainer.innerHTML = '';
    }

    loadExample() {
        const example = `proc uno {
t200 = pos + 1
t201 = pila[t200]
t202 = pila[t201]
print t202
}

proc calcula {
t1 = pos + 2
pila[t1] = 1
t3 = pos + 0
t4 = pila[t3]
t5 = pos + 1
t6 = pila[t5]
t7 = pila[t6]
if t4 > t7 then goto L1
goto L2

L1:
t8 = pos + 1
t9 = pila[t8]
t10 = pos + 1
t11 = pila[t10]
t12 = pila[t11]
t13 = t12 + 1
pila[t9] = t13
t14 = pos + 3
t15 = pos + 0
t16 = pila[t15]
t17 = t16 - 1
t18 = t14 + 0
pila[t18] = t17
t19 = pos + 1
t20 = pila[t19]
t21 = t14 + 1
pila[t21] = t20
pos = pos + 3
call calcula
pos = pos - 3
goto L3

L2:
pos = pos + 3
call uno
pos = pos - 3

L3:
}

pos = 0
pila[0] = 4
pila[1] = 12
pila[12] = 1
call calcula
t300 = pila[12]
print t300
end`;

        this.codeEditor.value = example;
        this.resetSessionState();
        this.clearOutput();
        this.graphContainer.innerHTML = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new C3DPlaygroundApp();
});
