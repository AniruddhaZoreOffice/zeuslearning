export default class RowResizeHandler {
    /**
     * @param {import('../grid').default} grid The grid instance
     */
    constructor(grid) {
        this.grid = grid;
        this.canvas = grid.canvas;
        this.handleSize = 4;

        // State for the resize operation
        this.isResizing = false;
        this.targetRowIndex = null;
        this.resizeStartPos = 0;
        this.originalHeight = 0;

        // Bound versions of the handlers for window event listeners
        this.boundHandleMouseMove = this.handleMouseMove.bind(this);
        this.boundHandleMouseUp = this.handleMouseUp.bind(this);
    }

    /**
     * 1. Hit-Test Function: Checks if the mouse is over a row resize handle.
     * @param {{x: number, y: number}} mousePos The position of the mouse relative to the canvas.
     * @returns {{index: number}|null} A target object with the row index if found, otherwise null.
     */
    findResizeTarget(mousePos) {
        if (mousePos.x > this.grid.headerWidth) return null;

        let currentY = this.grid.headerHeight;
        for (let r = 0; r < this.grid.rows; r++) {
            currentY += this.grid.rowHeights[r];
            const edgeY = currentY - this.grid.scrollY;

            if (Math.abs(mousePos.y - edgeY) < this.handleSize) {
                return { index: r };
            }
        }
        return null;
    }

    /**
     * 2. MouseDown Handler: Begins a resize operation if the mouse is on a handle.
     * @param {MouseEvent} event The mouse down event.
     */
    handleMouseDown(event) {
        const mousePos = { x: event.offsetX, y: event.offsetY };
        const target = this.findResizeTarget(mousePos);

        if (target) {
            this.isResizing = true;
            this.targetRowIndex = target.index;
            this.resizeStartPos = event.clientY;
            this.originalHeight = this.grid.getRowHeight(this.targetRowIndex);

            window.addEventListener('mousemove', this.boundHandleMouseMove);
            window.addEventListener('mouseup', this.boundHandleMouseUp);

            event.stopPropagation();
            event.preventDefault();
        }
    }

    /**
     * 3. MouseMove Handler: Handles both hover effects and active resizing.
     * @param {MouseEvent} event The mouse move event.
     * @returns {boolean} True if the handler is actively managing the cursor, otherwise false.
     */
    handleMouseMove(event) {
        if (this.isResizing) {
            const deltaY = event.clientY - this.resizeStartPos;
            let newHeight = this.originalHeight + deltaY;
            newHeight = Math.max(20, newHeight); // Enforce minimum height

            this.grid.setRowHeight(this.targetRowIndex, newHeight);
            return true;
        } else {
            const mousePos = { x: event.offsetX, y: event.offsetY };
            if (this.findResizeTarget(mousePos)) {
                this.grid.setCursor('row-resize');
                return true;
            }
        }
        return false;
    }

    /**
     * 4. MouseUp Handler: Ends the resize operation.
     * @param {MouseEvent} event The mouse up event.
     */
    handleMouseUp(event) {
        if (this.isResizing) {
            this.isResizing = false;
            this.targetRowIndex = null;

            window.removeEventListener('mousemove', this.boundHandleMouseMove);
            window.removeEventListener('mouseup', this.boundHandleMouseUp);

            this.grid.updateScrollbarContentSize();
        }
    }
}