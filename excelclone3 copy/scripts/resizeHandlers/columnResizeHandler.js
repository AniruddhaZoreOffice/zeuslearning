export default class ColumnResizeHandler {
    /**
     * @param {import('./grid').default} grid The grid instance
     */
    constructor(grid) {
        this.grid = grid;
        this.resizeHandleSize = 4;
    }

    /**
     * Checks if the mouse is over a column resize handle.
     * @param {{x: number, y: number}} mousePos The position of the mouse relative to the canvas.
     * @returns {{type: 'col', index: number}|null} A target object if found, otherwise null.
     */
    getResizeTarget(mousePos) {
        if (mousePos.y > this.grid.headerHeight) return null;

        let currentX = this.grid.headerWidth;
        for (let c = 1; c < this.grid.cols; c++) {
            currentX += this.grid.colWidths[c];
            const edgeX = currentX - this.grid.scrollX;
            if (Math.abs(mousePos.x - edgeX) < this.resizeHandleSize) {
                return { type: 'col', index: c };
            }
        }
        return null;
    }

    /**
     * Applies the resize operation for a column.
     * @param {{type: 'col', index: number}} target The resize target.
     * @param {{x: number, y: number}} resizeStartPos The initial mouse position.
     * @param {number} originalSize The original width of the column.
     * @param {MouseEvent} event The mouse move event.
     */
    resize(target, resizeStartPos, originalSize, event) {
        const deltaX = event.clientX - resizeStartPos.x;
        let newSize = originalSize + deltaX;
        newSize = Math.max(20, newSize); // Minimum width
        this.grid.setColumnWidth(target.index, newSize);
    }
}