
export default class RowResizeHandler {
    /**
     * @param {import('./grid').default} grid The grid instance
     */
    constructor(grid) {
        this.grid = grid;
        this.resizeHandleSize = 4;
    }

    /**
     * Checks if the mouse is over a row resize handle.
     * @param {{x: number, y: number}} mousePos The position of the mouse relative to the canvas.
     * @returns {{type: 'row', index: number}|null} A target object if found, otherwise null.
     */
    getResizeTarget(mousePos) {
        if (mousePos.x > this.grid.headerWidth) return null;

        let currentY = this.grid.headerHeight;
        for (let r = 1; r < this.grid.rows; r++) {
            currentY += this.grid.rowHeights[r];
            const edgeY = currentY - this.grid.scrollY;
            if (Math.abs(mousePos.y - edgeY) < this.resizeHandleSize) {
                return { type: 'row', index: r };
            }
        }
        return null;
    }

    /**
     * Applies the resize operation for a row.
     * @param {{type: 'row', index: number}} target The resize target.
     * @param {{x: number, y: number}} resizeStartPos The initial mouse position.
     * @param {number} originalSize The original height of the row.
     * @param {MouseEvent} event The mouse move event.
     */
    resize(target, resizeStartPos, originalSize, event) {
        const deltaY = event.clientY - resizeStartPos.y;
        let newSize = originalSize + deltaY;
        newSize = Math.max(20, newSize); // Minimum height
        this.grid.setRowHeight(target.index, newSize);
    }
}