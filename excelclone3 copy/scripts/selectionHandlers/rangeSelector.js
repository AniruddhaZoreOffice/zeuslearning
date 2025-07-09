export default class RangeSelector {
    /**
     * @param {import('../grid').default} grid The grid instance
     */
    constructor(grid) {
        this.grid = grid;
    }

    /**
     * Starts a cell/range selection.
     * Assumes the activeCell has already been set by the SelectionHandler.
     * @param {MouseEvent} event The mouse down event.
     * @param {number} row The starting row.
     * @param {number} col The starting column.
     * @returns {boolean} True if a drag operation should start, false otherwise.
     */
    start(event, row, col) {
        if (event.shiftKey && this.grid.activeCell) {
            // For shift-click, extend the selection from the existing active cell.
            this.grid.selectionArea = {
                start: this.grid.activeCell,
                end: { row, col }
            };
            this.end(); // Normalize immediately
            return false; // This is a one-off action, not a drag.
        } else {
            // For a normal click/drag, the activeCell IS the start of our selection.
            this.grid.selectionArea = {
                start: this.grid.activeCell,
                end: this.grid.activeCell
            };
            return true; // Indicates that dragging SHOULD start.
        }
    }

    /**
     * Updates the selection range during a mouse drag.
     * @param {{x: number, y: number}} mousePos The current mouse position.
     */
    update(mousePos) {
        if (!this.grid.selectionArea) return;

        const newRow = this.grid.rowAtY(mousePos.y + this.grid.scrollY);
        const newCol = this.grid.colAtX(mousePos.x + this.grid.scrollX);

        if (newRow === null || newCol === null) return;

        const currentEnd = this.grid.selectionArea.end;

        if (newRow !== currentEnd.row || newCol !== currentEnd.col) {
            this.grid.selectionArea.end = { row: newRow, col: newCol };
            this.grid.requestRedraw();
        }
    }

    /**
     * Finalizes and normalizes the selection.
     */
    end() {
        if (!this.grid.selectionArea) return;
        const { start, end } = this.grid.selectionArea;

        const minRow = Math.min(start.row, end.row);
        const maxRow = Math.max(start.row, end.row);
        const minCol = Math.min(start.col, end.col);
        const maxCol = Math.max(start.col, end.col);

        this.grid.selectionArea = {
            start: { row: minRow, col: minCol },
            end: { row: maxRow, col: maxCol }
        };
    }
}