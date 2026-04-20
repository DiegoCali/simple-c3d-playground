/**
 * Parser.js
 * 
 * Responsabilidad Única (S): Parsear código C3D y convertirlo en instrucciones estructuradas.
 * 
 * Principio Open/Closed (O): Se puede extender agregando nuevos tipos de instrucciones
 * sin modificar el código existente.
 */

export class C3DParser {
    constructor() {
        // Operadores en orden de precedencia para el parsing
        this.operators = ['>=', '<=', '==', '!=', '&&', '||', '>', '<', '+', '-', '*', '/'];
    }

    /**
     * Parsea el código C3D y retorna instrucciones estructuradas y labels
     * @param {string} code - Código C3D completo
     * @returns {Object} { instructions: Array, labels: Map }
     */
    parse(code) {
        const lines = this.preprocessCode(code);
        const instructions = [];
        const labels = new Map();
        
        let instructionIndex = 0;

        // Primera pasada: identificar todas las etiquetas
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            if (this.isLabel(line)) {
                const labelName = this.extractLabelName(line);
                labels.set(labelName, instructionIndex);
            } else {
                const parsed = this.parseLine(line);
                if (parsed) {
                    if (parsed.type === 'proc_start') {
                        labels.set(parsed.name, instructionIndex);
                    }
                    instructionIndex++;
                }
            }
        }

        // Segunda pasada: parsear instrucciones con contexto de etiquetas
        instructionIndex = 0;
        let currentLabel = 'INICIO';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            if (this.isLabel(line)) {
                currentLabel = this.extractLabelName(line);
            } else {
                const parsed = this.parseLine(line);
                if (parsed) {
                    if (parsed.type === 'proc_start') {
                        currentLabel = parsed.name;
                    }

                    parsed.label = currentLabel;
                    parsed.index = instructionIndex;
                    instructions.push(parsed);
                    instructionIndex++;

                    if (parsed.type === 'endproc') {
                        currentLabel = 'INICIO';
                    }
                }
            }
        }

        return { instructions, labels };
    }

    /**
     * Preprocesa el código: elimina comentarios, líneas vacías y normaliza
     * @param {string} code
     * @returns {Array<string>}
     */
    preprocessCode(code) {
        return code
            .split('\n')
            .map(line => this.stripInlineComments(line).trim())
            .filter(line => line.length > 0)
            .filter(line => !line.startsWith('//') && !line.startsWith('#'));
    }

    /**
     * Elimina comentarios inline simples
     * @param {string} line
     * @returns {string}
     */
    stripInlineComments(line) {
        const markers = ['//', '#', '/*'];
        let cutIndex = line.length;

        markers.forEach(marker => {
            const index = line.indexOf(marker);
            if (index !== -1 && index < cutIndex) {
                cutIndex = index;
            }
        });

        return line.slice(0, cutIndex);
    }

    /**
     * Verifica si una línea es una etiqueta
     * @param {string} line
     * @returns {boolean}
     */
    isLabel(line) {
        return line.endsWith(':');
    }

    /**
     * Extrae el nombre de una etiqueta
     * @param {string} line
     * @returns {string}
     */
    extractLabelName(line) {
        return line.slice(0, -1).trim();
    }

    /**
     * Parsea una línea de código C3D
     * @param {string} line
     * @returns {Object|null}
     */
    parseLine(line) {
        // Marcador de apertura de bloque ignorado
        if (line === '{') {
            return null;
        }

        // Cierre de procedimiento por llave
        if (line === '}') {
            return { type: 'endproc' };
        }

        // inicio de procedimiento
        const procMatch = line.match(/^proc(?:edure)?\s+([A-Za-z_]\w*)\s*(?:\([^)]*\))?\s*\{?$/i);
        if (procMatch) {
            return this.parseProcStart(procMatch);
        }

        // end
        if (/^end$/i.test(line)) {
            return { type: 'end' };
        }

        // endproc
        if (/^endproc$/i.test(line)) {
            return { type: 'endproc' };
        }

        // return
        if (/^return$/i.test(line)) {
            return { type: 'return' };
        }

        // print
        const printMatch = line.match(/^print\s+(.+)$/i);
        if (printMatch) {
            return this.parsePrint(printMatch);
        }

        // call
        const callMatch = line.match(/^call\s+([A-Za-z_]\w*)(?:\s*\(\s*\))?$/i);
        if (callMatch) {
            return this.parseCall(callMatch);
        }

        // goto simple
        const gotoMatch = line.match(/^goto\s+([A-Za-z_]\w*)$/i);
        if (gotoMatch) {
            return this.parseGoto(gotoMatch);
        }

        // if ... goto (condicional)
        const ifGotoMatch = line.match(/^if\s+(.+?)\s+(?:then\s+)?goto\s+([A-Za-z_]\w*)$/i);
        if (ifGotoMatch) {
            return this.parseIfGoto(ifGotoMatch);
        }

        // Escritura a pila
        const stackStoreMatch = line.match(/^(?:pila|stack)\s*\[\s*(.+?)\s*\]\s*=\s*(.+)$/i);
        if (stackStoreMatch) {
            return this.parseStackStore(stackStoreMatch);
        }

        // Lectura desde pila
        const stackLoadMatch = line.match(/^(\w+)\s*=\s*(?:pila|stack)\s*\[\s*(.+?)\s*\]$/i);
        if (stackLoadMatch) {
            return this.parseStackLoad(stackLoadMatch);
        }

        // Asignación
        const assignMatch = line.match(/^(\w+)\s*=\s*(.+)$/);
        if (assignMatch) {
            return this.parseAssignment(assignMatch[1].trim(), assignMatch[2].trim());
        }

        throw new Error(`Línea no reconocida: ${line}`);
    }

    /**
     * Parsea instrucción print
     * @param {string} line
     * @returns {Object}
     */
    parsePrint(match) {
        const value = match[1].trim();
        return { type: 'print', value };
    }

    /**
     * Parsea inicio de procedimiento
     * @param {Array} match
     * @returns {Object}
     */
    parseProcStart(match) {
        return {
            type: 'proc_start',
            name: match[1].trim()
        };
    }

    /**
     * Parsea instrucción call
     * @param {Array} match
     * @returns {Object}
     */
    parseCall(match) {
        return {
            type: 'call',
            target: match[1].trim()
        };
    }

    /**
     * Parsea instrucción goto
     * @param {string} line
     * @returns {Object}
     */
    parseGoto(match) {
        const target = match[1].trim();
        return { type: 'goto', target };
    }

    /**
     * Parsea instrucción if ... goto
     * @param {Array} match - Resultado del regex match
     * @returns {Object}
     */
    parseIfGoto(match) {
        const condition = match[1].trim();
        const target = match[2].trim();
        return { 
            type: 'if_goto', 
            condition, 
            target 
        };
    }

    /**
     * Parsea escritura en pila: pila[idx] = valor
     * @param {Array} match
     * @returns {Object}
     */
    parseStackStore(match) {
        return {
            type: 'stack_store',
            stackIndex: match[1].trim(),
            value: match[2].trim()
        };
    }

    /**
     * Parsea lectura de pila: var = pila[idx]
     * @param {Array} match
     * @returns {Object}
     */
    parseStackLoad(match) {
        return {
            type: 'stack_load',
            variable: match[1].trim(),
            stackIndex: match[2].trim()
        };
    }

    /**
     * Parsea asignación: variable = expresión
     * @param {string} variable
     * @param {string} expression
     * @returns {Object}
     */
    parseAssignment(variable, expression) {
        // Intentar parsear como operación binaria
        for (const op of this.operators) {
            const index = expression.indexOf(op);
            if (index > 0 && index < expression.length - op.length) {
                const left = expression.substring(0, index).trim();
                const right = expression.substring(index + op.length).trim();
                
                if (left && right) {
                    return {
                        type: 'assign',
                        variable,
                        left,
                        operator: op,
                        right
                    };
                }
            }
        }

        // Asignación simple: variable = valor
        return {
            type: 'assign_simple',
            variable,
            value: expression
        };
    }
}
