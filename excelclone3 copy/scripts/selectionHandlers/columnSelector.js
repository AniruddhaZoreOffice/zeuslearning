export default class ColumnSelector {
    /**
     * @param {import('./grid').default} grid The grid instance
     */
    constructor(grid) {
        this.grid = grid;
        this.startCol = null;
        this.selectionBeforeDrag = new Set();
    }

    /**
     * Starts a column selection.
     * @param {MouseEvent} event The mouse down event.
     * @param {number} col The starting column.
     */
    start(event, col) {
        this.grid.selectionArea = null;
        this.grid.activeCell = null;
        this.startCol = col;

        const isExtend = event.ctrlKey || event.metaKey;
        if (isExtend) {
            this.selectionBeforeDrag = new Set(this.grid.selectedColumns);
        } else {
            this.selectionBeforeDrag.clear();
            this.grid.selectedRows.clear();
            this.grid.selectedColumns.clear();
        }

        this.update(null, col); // Initial selection
    }

    /**
     * Updates the column selection during a mouse drag.
     * @param {{x: number, y: number}} mousePos The current mouse position.
     * @param {number} [ currentCol ] The column under the mouse, if known.
     */
    update(mousePos, currentCol) {
        const endCol = currentCol !== undefined 
            ? currentCol 
            : this.grid.colAtX(mousePos.x + this.grid.scrollX);
        
        if (endCol === null) return;

        const rangeStart = Math.min(this.startCol, endCol);
        const rangeEnd = Math.max(this.startCol, endCol);
        
        const currentDragRange = new Set();
        for (let i = rangeStart; i <= rangeEnd; i++) {
            currentDragRange.add(i);
        }

        const targetSet = this.grid.selectedColumns;
        targetSet.clear();

        // Combine the selection before the drag with the current drag selection
        for (const item of this.selectionBeforeDrag) targetSet.add(item);
        for (const item of currentDragRange) targetSet.add(item);
        
        this.grid.requestRedraw();
    }

    /**
     * Finalizes the selection by clearing temporary state.
     */
    end() {
        this.startCol = null;
        this.selectionBeforeDrag.clear();
    }
}