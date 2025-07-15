export default class CellEditor {
    /**
     * Initializes the cell editor component. It creates the input element but
     * does not attach its own event listeners.
     * @param {import('./grid').default} grid The main grid instance.
     */
    constructor(grid) {
        this.grid = grid;
        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.className = 'cell-editor';
        this.grid.container.appendChild(this.input);

        this.editingCell = null;

    }

     /**
     * Shows and positions the editor over a given cell.
     * @param {{row: number, col: number}} cell The cell to edit.
     * @param {?string} [initialValue=null] The initial character to populate the editor with. If null, the cell's existing data is used.
     */
    startEditing(cell, initialValue = null) {
        if (!cell) return;
        this.editingCell = cell;
        const { row, col } = cell;

        this.grid.isEditing = true;
        this.grid.requestRedraw(); 

        // --- All your positioning and styling code remains the same ---
        const x = this.grid.getColX(col) - this.grid.scrollX;
        const y = this.grid.getRowY(row) - this.grid.scrollY;
        const width = this.grid.getColWidth(col);
        const height = this.grid.getRowHeight(row);

        this.input.style.display = 'block';
        this.input.style.position = 'absolute';
        this.input.style.left = `${x + 0.5}px`;
        this.input.style.top = `${y + 0.5}px`;
        this.input.style.width = `${width}px`;
        this.input.style.height = `${height}px`;
        this.input.style.font = '14px Arial';
        this.input.style.border = '2px solid #107C41'; 
        this.input.style.outline = 'none';
        this.input.style.boxSizing = 'border-box';
        this.input.style.padding = '0 4px';
       
        this.input.focus();

        if (initialValue !== null) {
            
            this.input.value = initialValue ;
            this.input.setSelectionRange(1, 1); 
        } else {
            
            this.input.value = this.grid.dataStorage.getCellValue(row, col) || '';
            this.input.select();
        }
    }

    /**
     * Hides the editor and optionally saves the new value.
     * @param {boolean} save 
     */
    stopEditing(save = true) {
        if (!this.editingCell) return;

        if (save) {
            this.grid.dataStorage.setCellValue(this.editingCell.row, this.editingCell.col, this.input.value);
        }

        this.input.style.display = 'none';
        this.editingCell = null;
        this.grid.isEditing = false;
        this.grid.canvas.focus();
        this.grid.requestRedraw();
    }

    handleBlur() {
        this.stopEditing(true);
    }

    handleKeyDown(event) {
        switch (event.key) {
            case 'Enter':
            case 'ArrowDown':
                event.preventDefault(); 
                event.stopPropagation();
                this.grid.stopEditingAndMove(0, 1); 
                return; 

            case 'ArrowUp':
                event.preventDefault();
                event.stopPropagation();
                this.grid.stopEditingAndMove(0, -1); 
                return;

            case 'ArrowLeft':
                
                if (this.input.selectionStart === 0 && this.input.selectionEnd === 0) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.grid.stopEditingAndMove(-1, 0); 
                }
                return;

            case 'ArrowRight':
                
                if (this.input.selectionStart === this.input.value.length && this.input.selectionEnd === this.input.value.length) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.grid.stopEditingAndMove(1, 0);
                }
                return;
            
            case 'Tab':
                event.preventDefault();
                event.stopPropagation();
                if (event.shiftKey) {
                    this.grid.stopEditingAndMove(-1, 0);
                } else {
                    this.grid.stopEditingAndMove(1, 0); 
                }
                return;
                
            }
    }

    isActive() {
        return this.editingCell !== null;
    }

    /**
     * Repositions the editor if it's active (e.g., after a column/row resize).
     */
    reposition() {
        if (!this.isActive()) return;
        this.startEditing(this.editingCell);
    }
}