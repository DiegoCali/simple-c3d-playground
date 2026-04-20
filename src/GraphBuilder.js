/**
 * GraphBuilder.js
 * 
 * Responsabilidad Única (S): Convertir bloques básicos a sintaxis Mermaid.
 * 
 * Open/Closed (O): Permitir diferentes formatos de salida sin modificar la lógica core.
 */

export class MermaidGraphBuilder {
    constructor(blocks, edges) {
        this.blocks = blocks;
        this.edges = edges;
    }

    /**
     * Genera código Mermaid para el diagrama de flujo
     * @returns {string}
     */
    build() {
        if (this.blocks.length === 0) {
            return 'graph TD\n    Empty["No hay bloques para visualizar"]';
        }

        const lines = ['graph TD'];
        
        // Definir nodos
        this.blocks.forEach(block => {
            const nodeDefinition = this.buildNodeDefinition(block);
            lines.push(`    ${nodeDefinition}`);
        });

        // Definir edges
        this.edges.forEach(edge => {
            const edgeDefinition = this.buildEdgeDefinition(edge);
            lines.push(`    ${edgeDefinition}`);
        });

        // Estilos opcionales para mejorar la visualización
        lines.push('');
        lines.push('    %% Estilos');
        lines.push('    classDef default fill:#f9f9f9,stroke:#333,stroke-width:2px');

        return lines.join('\n');
    }

    /**
     * Construye la definición de un nodo en sintaxis Mermaid
     * @param {Object} block
     * @returns {string}
     */
    buildNodeDefinition(block) {
        const nodeId = this.sanitizeId(block.label);
        const nodeLabel = this.buildNodeLabel(block);
        
        // Usar formato rectangular con esquinas redondeadas
        return `${nodeId}["${nodeLabel}"]`;
    }

    /**
     * Construye el contenido/label de un nodo
     * @param {Object} block
     * @returns {string}
     */
    buildNodeLabel(block) {
        const lines = [block.label];
        
        // Agregar hasta 4 instrucciones
        const maxInstructions = 4;
        const instructions = block.instructions.slice(0, maxInstructions);
        
        instructions.forEach(instr => {
            const instrText = this.instructionToString(instr);
            lines.push(instrText);
        });
        
        // Indicar si hay más instrucciones
        if (block.instructions.length > maxInstructions) {
            lines.push('...');
        }
        
        // Unir con saltos de línea (Mermaid usa <br/> o \n)
        return lines.join('<br/>');
    }

    /**
     * Convierte una instrucción a string legible
     * @param {Object} instr
     * @returns {string}
     */
    instructionToString(instr) {
        switch (instr.type) {
            case 'assign':
                return `${instr.variable} = ${instr.left} ${instr.operator} ${instr.right}`;
            case 'assign_simple':
                return `${instr.variable} = ${instr.value}`;
            case 'print':
                return `print ${instr.value}`;
            case 'proc_start':
                return `proc ${instr.name}`;
            case 'call':
                return `call ${instr.target}`;
            case 'goto':
                return `goto ${instr.target}`;
            case 'if_goto':
                return `if ${instr.condition} goto ${instr.target}`;
            case 'stack_store':
                return `pila[${instr.stackIndex}] = ${instr.value}`;
            case 'stack_load':
                return `${instr.variable} = pila[${instr.stackIndex}]`;
            case 'return':
                return 'return';
            case 'endproc':
                return 'endproc';
            case 'end':
                return 'end';
            default:
                return '';
        }
    }

    /**
     * Construye la definición de una arista en sintaxis Mermaid
     * @param {Object} edge
     * @returns {string}
     */
    buildEdgeDefinition(edge) {
        const fromId = this.sanitizeId(edge.from);
        const toId = this.sanitizeId(edge.to);
        
        // Determinar el estilo de la arista
        if (edge.label) {
            // Edge con etiqueta (true/false para condicionales)
            return `${fromId} -->|${edge.label}| ${toId}`;
        } else {
            // Edge simple
            return `${fromId} --> ${toId}`;
        }
    }

    /**
     * Sanitiza un ID para que sea válido en Mermaid
     * @param {string} id
     * @returns {string}
     */
    sanitizeId(id) {
        // Reemplazar caracteres especiales por guiones bajos
        return id.replace(/[^a-zA-Z0-9_]/g, '_');
    }
}
