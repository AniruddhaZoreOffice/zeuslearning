export default class RowSelector {
    /**
     * @param {import('./grid').default} grid The grid instance
     */
    constructor(grid) {
        this.grid = grid;
        this.startRow = null;
        this.selectionBeforeDrag = new Set();
    }

    /**
     * Starts a row selection.
     * @param {MouseEvent} event The mouse down event.
     * @param {number} row The starting row.
     */
    start(event, row) {
        
        this.startRow = row;

        const isExtend = event.ctrlKey || event.metaKey;
        if (isExtend) {
            this.selectionBeforeDrag = new Set(this.grid.selectedRows);
        } else {
            this.selectionBeforeDrag.clear();
            this.grid.selectedColumns.clear();
            this.grid.selectedRows.clear();
        }

        this.update(null, row); // Initial selection
    }

    /**
     * Updates the row selection during a mouse drag.
     * @param {{x: number, y: number}} mousePos The current mouse position.
     * @param {number} [ currentRow ] The row under the mouse, if known.
     */
    update(mousePos, currentRow) {
        const endRow = currentRow !== undefined 
            ? currentRow 
            : this.grid.rowAtY(mousePos.y + this.grid.scrollY);

        if (endRow === null) return;

        const rangeStart = Math.min(this.startRow, endRow);
        const rangeEnd = Math.max(this.startRow, endRow);
        
        const currentDragRange = new Set();
        for (let i = rangeStart; i <= rangeEnd; i++) {
            currentDragRange.add(i);
        }

        const targetSet = this.grid.selectedRows;
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
        this.startRow = null;
        this.selectionBeforeDrag.clear();
    }
}