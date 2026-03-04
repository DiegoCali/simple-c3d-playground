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
                    parsed.label = currentLabel;
                    parsed.index = instructionIndex;
                    instructions.push(parsed);
                    instructionIndex++;
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
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .filter(line => !line.startsWith('//') && !line.startsWith('#'));
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
        // end
        if (line === 'end') {
            return { type: 'end' };
        }

        // print
        if (line.startsWith('print ')) {
            return this.parsePrint(line);
        }

        // goto simple
        if (line.startsWith('goto ')) {
            return this.parseGoto(line);
        }

        // if ... goto (condicional)
        const ifGotoMatch = line.match(/^if\s+(.+?)\s+goto\s+(\w+)$/);
        if (ifGotoMatch) {
            return this.parseIfGoto(ifGotoMatch);
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
    parsePrint(line) {
        const value = line.substring(6).trim();
        return { type: 'print', value };
    }

    /**
     * Parsea instrucción goto
     * @param {string} line
     * @returns {Object}
     */
    parseGoto(line) {
        const target = line.substring(5).trim();
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
