/**
 * Interpreter.js
 * 
 * Responsabilidad Única (S): Ejecutar instrucciones C3D previamente parseadas.
 * 
 * Dependency Inversion (D): Recibe instrucciones y labels como dependencias inyectadas,
 * no los genera internamente.
 */

export class C3DInterpreter {
    constructor(instructions, labels) {
        this.instructions = instructions;
        this.labels = labels;
        this.variables = new Map();
        this.pc = 0; // Program counter
        this.output = [];
        this.maxIterations = 100000;

        this.stackSize = 20;
        this.stack = new Array(this.stackSize).fill(0);
        this.pos = 0;
        this.callStack = [];
        this.procedures = this.buildProcedureTable();

        this.iterations = 0;
        this.halted = false;
        this.loopLimitReported = false;

        this.initializeSpecialVariables();
    }

    /**
     * Inicializa variables especiales del runtime
     */
    initializeSpecialVariables() {
        this.variables.set('pos', this.pos);
        this.variables.set('ptr', this.pos);
    }

    /**
     * Construye tabla de procedimientos con su rango de instrucciones
     * @returns {Map<string, { start: number, endExclusive: number }>}
     */
    buildProcedureTable() {
        const procedures = new Map();
        const procStarts = [];

        for (let i = 0; i < this.instructions.length; i++) {
            const instruction = this.instructions[i];
            if (instruction.type === 'proc_start') {
                procStarts.push({ name: instruction.name, start: i });
            }
        }

        procStarts.forEach((proc, index) => {
            const nextStart = index < procStarts.length - 1
                ? procStarts[index + 1].start
                : this.instructions.length;

            let endExclusive = nextStart;

            for (let i = proc.start + 1; i < nextStart; i++) {
                if (this.instructions[i].type === 'endproc') {
                    endExclusive = i + 1;
                    break;
                }
            }

            procedures.set(proc.name, {
                start: proc.start,
                endExclusive
            });
        });

        return procedures;
    }

    /**
     * Ejecuta todas las instrucciones
     * @returns {Object} { output: Array, variables: Map }
     */
    run() {
        while (!this.isHalted()) {
            this.step();
        }

        if (this.iterations >= this.maxIterations && !this.loopLimitReported) {
            this.output.push({ type: 'error', message: 'Límite de iteraciones alcanzado (posible bucle infinito)' });
            this.loopLimitReported = true;
        }

        this.halted = true;

        return this.getResult();
    }

    /**
     * Ejecuta un solo paso de interpretación
     * @returns {Object}
     */
    step() {
        if (this.halted) {
            return this.getResult();
        }

        if (this.iterations >= this.maxIterations) {
            if (!this.loopLimitReported) {
                this.output.push({
                    type: 'error',
                    message: 'Límite de iteraciones alcanzado (posible bucle infinito)'
                });
                this.loopLimitReported = true;
            }
            this.halted = true;
            return this.getResult();
        }

        let lastStep = {
            kind: 'none',
            pcBefore: this.pc,
            pcAfter: this.pc,
            instruction: null
        };

        try {
            if (this.shouldReturnFromCurrentProcedure()) {
                lastStep = this.executeImplicitReturn();
                this.iterations++;
                return this.getResult(lastStep);
            }

            if (this.pc < 0 || this.pc >= this.instructions.length) {
                if (this.callStack.length > 0) {
                    lastStep = this.executeImplicitReturn();
                    this.iterations++;
                    return this.getResult(lastStep);
                }

                this.halted = true;
                return this.getResult(lastStep);
            }

            const instruction = this.instructions[this.pc];
            const pcBefore = this.pc;
            const instructionResult = this.executeInstruction(instruction);

            if (instructionResult === 'returned') {
                lastStep = {
                    kind: 'return',
                    pcBefore,
                    pcAfter: this.pc,
                    instruction
                };
                this.iterations++;
                return this.getResult(lastStep);
            }

            if (!instructionResult) {
                this.halted = true;
                lastStep = {
                    kind: 'halt',
                    pcBefore,
                    pcAfter: this.pc,
                    instruction
                };
                this.iterations++;
                return this.getResult(lastStep);
            }

            this.pc++;
            lastStep = {
                kind: 'instruction',
                pcBefore,
                pcAfter: this.pc,
                instruction
            };
            this.iterations++;

            if (this.iterations >= this.maxIterations && !this.loopLimitReported) {
                this.output.push({ type: 'error', message: 'Límite de iteraciones alcanzado (posible bucle infinito)' });
                this.loopLimitReported = true;
                this.halted = true;
            }
        } catch (error) {
            this.output.push({ type: 'error', message: error.message });
            this.halted = true;
            lastStep = {
                kind: 'error',
                pcBefore: this.pc,
                pcAfter: this.pc,
                instruction: this.instructions[this.pc] || null
            };
        }

        return this.getResult(lastStep);
    }

    /**
     * Retorna si la sesión ya terminó
     * @returns {boolean}
     */
    isHalted() {
        return this.halted || this.iterations >= this.maxIterations;
    }

    /**
     * Retorno implícito al terminar un procedimiento
     * @returns {Object}
     */
    executeImplicitReturn() {
        const pcBefore = this.pc;
        this.returnFromCall();
        return {
            kind: 'implicit_return',
            pcBefore,
            pcAfter: this.pc,
            instruction: null
        };
    }

    /**
     * Construye resultado estándar de ejecución
     * @param {Object|null} lastStep
     * @returns {Object}
     */
    getResult(lastStep = null) {
        const currentInstruction = this.pc >= 0 && this.pc < this.instructions.length
            ? this.instructions[this.pc]
            : null;

        return {
            output: this.output,
            variables: this.variables,
            stack: this.stack.slice(),
            pos: this.pos,
            callDepth: this.callStack.length,
            pc: this.pc,
            iterations: this.iterations,
            halted: this.isHalted(),
            currentInstruction,
            lastStep
        };
    }

    /**
     * Verifica si debe retornar automaticamente al fin de un procedimiento
     * @returns {boolean}
     */
    shouldReturnFromCurrentProcedure() {
        if (this.callStack.length === 0) {
            return false;
        }

        const currentFrame = this.callStack[this.callStack.length - 1];
        return this.pc >= currentFrame.endExclusive;
    }

    /**
     * Realiza el retorno de una llamada
     */
    returnFromCall() {
        const frame = this.callStack.pop();
        this.pc = frame.returnPc;
    }

    /**
     * Ejecuta una instrucción individual
     * @param {Object} instruction
     * @returns {boolean} Retorna true si debe continuar ejecutando
     */
    executeInstruction(instruction) {
        switch (instruction.type) {
            case 'proc_start':
                return this.executeProcStart(instruction);

            case 'endproc':
                return this.executeEndProc();

            case 'return':
                return this.executeReturn();

            case 'end':
                return false;

            case 'print':
                return this.executePrint(instruction);

            case 'call':
                return this.executeCall(instruction);

            case 'goto':
                return this.executeGoto(instruction);

            case 'if_goto':
                return this.executeIfGoto(instruction);

            case 'assign':
                return this.executeAssign(instruction);

            case 'assign_simple':
                return this.executeAssignSimple(instruction);

            case 'stack_store':
                return this.executeStackStore(instruction);

            case 'stack_load':
                return this.executeStackLoad(instruction);

            default:
                throw new Error(`Tipo de instrucción desconocido: ${instruction.type}`);
        }
    }

    /**
     * Maneja inicio de procedimiento
     */
    executeProcStart(instruction) {
        if (this.callStack.length > 0) {
            return true;
        }

        const procedureInfo = this.procedures.get(instruction.name);
        if (procedureInfo) {
            this.pc = procedureInfo.endExclusive - 1;
        }

        return true;
    }

    /**
     * Maneja cierre de procedimiento
     */
    executeEndProc() {
        if (this.callStack.length === 0) {
            return true;
        }

        this.returnFromCall();
        return 'returned';
    }

    /**
     * Maneja retorno explicito
     */
    executeReturn() {
        if (this.callStack.length === 0) {
            return true;
        }

        this.returnFromCall();
        return 'returned';
    }

    /**
     * Ejecuta instrucción print
     */
    executePrint(instruction) {
        const value = this.getValue(instruction.value);
        this.output.push({ type: 'print', message: String(value) });
        return true;
    }

    /**
     * Ejecuta llamada a procedimiento
     */
    executeCall(instruction) {
        const procedureInfo = this.procedures.get(instruction.target);
        let targetIndex;
        let endExclusive;

        if (procedureInfo) {
            targetIndex = procedureInfo.start + 1;
            endExclusive = procedureInfo.endExclusive;
        } else if (this.labels.has(instruction.target)) {
            targetIndex = this.labels.get(instruction.target);
            endExclusive = this.instructions.length;
        } else {
            throw new Error(`Procedimiento no encontrado: ${instruction.target}`);
        }

        this.callStack.push({
            returnPc: this.pc + 1,
            procedure: instruction.target,
            endExclusive
        });

        this.pc = targetIndex - 1;
        return true;
    }

    /**
     * Ejecuta instrucción goto
     */
    executeGoto(instruction) {
        if (!this.labels.has(instruction.target)) {
            throw new Error(`Etiqueta no encontrada: ${instruction.target}`);
        }
        this.pc = this.labels.get(instruction.target) - 1;
        return true;
    }

    /**
     * Ejecuta instrucción if ... goto
     */
    executeIfGoto(instruction) {
        const conditionResult = this.evaluateCondition(instruction.condition);
        if (conditionResult) {
            if (!this.labels.has(instruction.target)) {
                throw new Error(`Etiqueta no encontrada: ${instruction.target}`);
            }
            this.pc = this.labels.get(instruction.target) - 1;
        }
        return true;
    }

    /**
     * Ejecuta asignación con operador binario
     */
    executeAssign(instruction) {
        const left = this.getValue(instruction.left);
        const right = this.getValue(instruction.right);
        const result = this.applyOperator(left, instruction.operator, right);
        this.setVariable(instruction.variable, result);
        return true;
    }

    /**
     * Ejecuta asignación simple
     */
    executeAssignSimple(instruction) {
        const value = this.evaluateExpression(instruction.value);
        this.setVariable(instruction.variable, value);
        return true;
    }

    /**
     * Ejecuta escritura en pila
     */
    executeStackStore(instruction) {
        const index = this.resolveStackIndex(instruction.stackIndex);
        const value = this.evaluateExpression(instruction.value);
        this.stack[index] = value;
        return true;
    }

    /**
     * Ejecuta lectura de pila
     */
    executeStackLoad(instruction) {
        const index = this.resolveStackIndex(instruction.stackIndex);
        const value = this.stack[index];
        this.setVariable(instruction.variable, value);
        return true;
    }

    /**
     * Evalua expresiones simples (token o binaria)
     * @param {string} expression
     * @returns {number}
     */
    evaluateExpression(expression) {
        const trimmed = expression.trim();
        const operators = ['>=', '<=', '==', '!=', '&&', '||', '+', '-', '*', '/', '>', '<'];

        for (const op of operators) {
            const index = trimmed.indexOf(op);
            if (index > 0 && index < trimmed.length - op.length) {
                const left = trimmed.substring(0, index).trim();
                const right = trimmed.substring(index + op.length).trim();

                if (left && right) {
                    const leftVal = this.getValue(left);
                    const rightVal = this.getValue(right);
                    return this.applyOperator(leftVal, op, rightVal);
                }
            }
        }

        return this.getValue(trimmed);
    }

    /**
     * Resuelve indice de stack y valida rango
     * @param {string} indexExpression
     * @returns {number}
     */
    resolveStackIndex(indexExpression) {
        const value = this.evaluateExpression(indexExpression);
        const index = Math.trunc(value);

        if (!Number.isFinite(index) || index !== value) {
            throw new Error(`Indice de pila invalido: ${indexExpression}`);
        }

        if (index < 0 || index >= this.stack.length) {
            throw new Error(`Indice de pila fuera de rango: ${index}`);
        }

        return index;
    }

    /**
     * Asigna variable respetando variables especiales
     * @param {string} variable
     * @param {number} value
     */
    setVariable(variable, value) {
        if (variable === 'pos' || variable === 'ptr') {
            this.pos = value;
            this.variables.set('pos', value);
            this.variables.set('ptr', value);
            return;
        }

        this.variables.set(variable, value);
    }

    /**
     * Obtiene el valor de un token (número literal o variable)
     * @param {string} token
     * @returns {number}
     */
    getValue(token) {
        const trimmed = token.trim();

        if (trimmed === 'pos' || trimmed === 'ptr') {
            return this.pos;
        }
        
        // Número literal
        if (!isNaN(trimmed) && trimmed !== '') {
            return parseFloat(trimmed);
        }
        
        // Variable
        if (this.variables.has(trimmed)) {
            return this.variables.get(trimmed);
        }
        
        throw new Error(`Variable no definida: ${trimmed}`);
    }

    /**
     * Evalúa una condición y retorna booleano
     * @param {string} condition
     * @returns {boolean}
     */
    evaluateCondition(condition) {
        const operators = ['>=', '<=', '==', '!=', '&&', '||', '>', '<'];
        
        for (const op of operators) {
            const index = condition.indexOf(op);
            if (index > 0 && index < condition.length - op.length) {
                const left = condition.substring(0, index).trim();
                const right = condition.substring(index + op.length).trim();
                
                if (left && right) {
                    const leftVal = this.getValue(left);
                    const rightVal = this.getValue(right);
                    return this.applyOperator(leftVal, op, rightVal);
                }
            }
        }
        
        // Si no hay operador, evaluar como booleano
        const value = this.getValue(condition);
        return value !== 0 && value !== false;
    }

    /**
     * Aplica un operador binario
     * @param {number} left
     * @param {string} operator
     * @param {number} right
     * @returns {number}
     */
    applyOperator(left, operator, right) {
        switch (operator) {
            case '+': return left + right;
            case '-': return left - right;
            case '*': return left * right;
            case '/': 
                if (right === 0) throw new Error('División por cero');
                return left / right;
            case '>': return left > right ? 1 : 0;
            case '<': return left < right ? 1 : 0;
            case '>=': return left >= right ? 1 : 0;
            case '<=': return left <= right ? 1 : 0;
            case '==': return left === right ? 1 : 0;
            case '!=': return left !== right ? 1 : 0;
            case '&&': return (left && right) ? 1 : 0;
            case '||': return (left || right) ? 1 : 0;
            default:
                throw new Error(`Operador desconocido: ${operator}`);
        }
    }
}
