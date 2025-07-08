export default class RangeSelector {
    /**
     * @param {import('../grid').default} grid The grid instance
     */
    constructor(grid) {
        this.grid = grid;
    }

    /**
     * Starts a cell/range selection.
     * @param {MouseEvent} event The mouse down event.
     * @param {number} row The starting row.
     * @param {number} col The starting column.
     * @returns {boolean} True if a drag operation should start, false otherwise.
     */
    start(event, row, col) {
        if (event.shiftKey && this.grid.activeCell) {
            // If shift is pressed, just extend the selection from the active cell.
            // This is a one-off action, not a drag.
            this.grid.selectionArea = {
                start: this.grid.activeCell,
                end: { row, col }
            };
            return false; // Crucially, indicates that dragging should NOT start.
        } else {
            // Otherwise, start a new selection from the clicked cell.
            this.grid.activeCell = { row, col };
            this.grid.selectionArea = {
                start: { row, col },
                end: { row, col }
            };
            return true; // Crucially, indicates that dragging SHOULD start.
        }
    }

    /**
     * Updates the selection range during a mouse drag.
     * @param {{x: number, y: number}} mousePos The current mouse position.
     */
    update(mousePos) {
        const row = this.grid.rowAtY(mousePos.y + this.grid.scrollY);
        const col = this.grid.colAtX(mousePos.x + this.grid.scrollX);
        if (row && col && this.grid.selectionArea) {
            this.grid.selectionArea.end = { row, col };
            this.grid.requestRedraw();
        }
    }

    /**
     * Finalizes the selection. (No specific action needed for range selection).
     */
    end() {
        
    }
}