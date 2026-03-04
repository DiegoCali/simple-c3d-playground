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
    }

    /**
     * Ejecuta todas las instrucciones
     * @returns {Object} { output: Array, variables: Map }
     */
    run() {
        let iterations = 0;
        
        while (this.pc < this.instructions.length && iterations < this.maxIterations) {
            const instruction = this.instructions[this.pc];
            
            try {
                const shouldContinue = this.executeInstruction(instruction);
                if (!shouldContinue) {
                    break;
                }
                this.pc++;
            } catch (error) {
                this.output.push({ type: 'error', message: error.message });
                break;
            }
            
            iterations++;
        }

        if (iterations >= this.maxIterations) {
            this.output.push({ 
                type: 'error', 
                message: 'Límite de iteraciones alcanzado (posible bucle infinito)' 
            });
        }

        return {
            output: this.output,
            variables: this.variables
        };
    }

    /**
     * Ejecuta una instrucción individual
     * @param {Object} instruction
     * @returns {boolean} Retorna true si debe continuar ejecutando
     */
    executeInstruction(instruction) {
        switch (instruction.type) {
            case 'end':
                return false;

            case 'print':
                return this.executePrint(instruction);

            case 'goto':
                return this.executeGoto(instruction);

            case 'if_goto':
                return this.executeIfGoto(instruction);

            case 'assign':
                return this.executeAssign(instruction);

            case 'assign_simple':
                return this.executeAssignSimple(instruction);

            default:
                throw new Error(`Tipo de instrucción desconocido: ${instruction.type}`);
        }
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
        this.variables.set(instruction.variable, result);
        return true;
    }

    /**
     * Ejecuta asignación simple
     */
    executeAssignSimple(instruction) {
        const value = this.getValue(instruction.value);
        this.variables.set(instruction.variable, value);
        return true;
    }

    /**
     * Obtiene el valor de un token (número literal o variable)
     * @param {string} token
     * @returns {number}
     */
    getValue(token) {
        const trimmed = token.trim();
        
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
