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
     * @param {{row: number, col: number}} cell 
     */
    startEditing(cell) {
        if (!cell) return;
        this.editingCell = cell;
        const { row, col } = cell;

        this.grid.isEditing = true;
        this.grid.requestRedraw(); 

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

        this.input.value = this.grid.dataStorage.getCellValue(row, col) || '';
        this.input.focus();
        this.input.select();
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
        if (event.key === 'Enter') {
            event.preventDefault();
            this.stopEditing(true);
        } else if (event.key === 'Escape') {
            event.preventDefault();
            this.stopEditing(false); 
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