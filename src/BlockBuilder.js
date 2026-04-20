/**
 * BlockBuilder.js
 * 
 * Responsabilidad Única (S): Construir bloques básicos a partir de instrucciones.
 * 
 * Un bloque básico es una secuencia de instrucciones donde:
 * - El flujo entra por el principio
 * - El flujo sale por el final
 * - No hay saltos en el medio
 */

export class BasicBlocksBuilder {
    constructor(instructions) {
        this.instructions = instructions;
        this.blocks = [];
    }

    /**
     * Construye los bloques básicos
     * @returns {Array<Object>}
     */
    build() {
        if (this.instructions.length === 0) {
            return [];
        }

        let currentBlock = this.createBlock(this.instructions[0].label || 'INICIO', 0);

        for (let i = 0; i < this.instructions.length; i++) {
            const instr = this.instructions[i];
            
            // Si cambia la etiqueta, cerrar bloque actual y crear nuevo
            if (instr.label !== currentBlock.label) {
                this.closeBlock(currentBlock, i - 1);
                currentBlock = this.createBlock(instr.label, i);
            }
            
            currentBlock.instructions.push(instr);
            
            // Cerrar bloque después de instrucciones de control de flujo
            if (this.isControlFlowInstruction(instr)) {
                this.closeBlock(currentBlock, i);
                
                // Preparar siguiente bloque si hay más instrucciones
                if (i < this.instructions.length - 1) {
                    const nextInstr = this.instructions[i + 1];
                    currentBlock = this.createBlock(nextInstr.label, i + 1);
                } else {
                    currentBlock = null;
                }
            }
        }

        // Agregar último bloque si existe
        if (currentBlock && currentBlock.instructions.length > 0) {
            this.closeBlock(currentBlock, this.instructions.length - 1);
        }

        return this.blocks;
    }

    /**
     * Crea un nuevo bloque
     * @param {string} label
     * @param {number} startIndex
     * @returns {Object}
     */
    createBlock(label, startIndex) {
        return {
            label,
            instructions: [],
            startIndex,
            endIndex: startIndex
        };
    }

    /**
     * Cierra un bloque y lo agrega a la lista
     * @param {Object} block
     * @param {number} endIndex
     */
    closeBlock(block, endIndex) {
        block.endIndex = endIndex;
        this.blocks.push(block);
    }

    /**
     * Verifica si una instrucción es de control de flujo
     * @param {Object} instruction
     * @returns {boolean}
     */
    isControlFlowInstruction(instruction) {
        return instruction.type === 'goto' 
            || instruction.type === 'if_goto' 
            || instruction.type === 'end'
            || instruction.type === 'endproc'
            || instruction.type === 'return';
    }

    /**
     * Genera las aristas (edges) entre bloques
     * @returns {Array<Object>}
     */
    getEdges() {
        const edges = [];

        for (let i = 0; i < this.blocks.length; i++) {
            const block = this.blocks[i];
            const lastInstr = block.instructions[block.instructions.length - 1];

            if (!lastInstr) continue;

            if (lastInstr.type === 'goto') {
                // Edge incondicional (goto simple)
                const targetBlock = this.findBlockByLabel(lastInstr.target);
                if (targetBlock) {
                    edges.push({
                        from: block.label,
                        to: targetBlock.label,
                        type: 'goto',
                        conditional: false
                    });
                }
            } else if (lastInstr.type === 'if_goto') {
                // Edge condicional (true) - hacia el label del goto
                const targetBlock = this.findBlockByLabel(lastInstr.target);
                if (targetBlock) {
                    edges.push({
                        from: block.label,
                        to: targetBlock.label,
                        type: 'if_true',
                        conditional: true,
                        label: 'true'
                    });
                }

                // Edge secuencial (false) - al siguiente bloque
                if (i < this.blocks.length - 1) {
                    const nextBlock = this.blocks[i + 1];
                    edges.push({
                        from: block.label,
                        to: nextBlock.label,
                        type: 'if_false',
                        conditional: true,
                        label: 'false'
                    });
                }
            } else if (lastInstr.type !== 'end' && lastInstr.type !== 'endproc' && lastInstr.type !== 'return') {
                // Edge secuencial normal
                if (i < this.blocks.length - 1) {
                    const nextBlock = this.blocks[i + 1];
                    edges.push({
                        from: block.label,
                        to: nextBlock.label,
                        type: 'sequential',
                        conditional: false
                    });
                }
            }
        }

        return edges;
    }

    /**
     * Busca un bloque por su etiqueta
     * @param {string} label
     * @returns {Object|undefined}
     */
    findBlockByLabel(label) {
        return this.blocks.find(b => b.label === label);
    }
}
