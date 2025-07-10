export default class ColumnResizeHandler {
    /**
     * @param {import('../grid').default} grid The grid instance
     */
    constructor(grid) {
        this.grid = grid;
        this.canvas = grid.canvas;
        this.handleSize = 4; // The clickable area for the resize handle

        // State for the resize operation
        this.isResizing = false;
        this.targetColumnIndex = null;
        this.resizeStartPos = 0;
        this.originalWidth = 0;

        // Bound versions of the handlers for window event listeners
        this.boundHandleMouseMove = this.handleMouseMove.bind(this);
        this.boundHandleMouseUp = this.handleMouseUp.bind(this);
    }

    /**
     * 1. Hit-Test Function: Checks if the mouse is over a column resize handle.
     * @param {{x: number, y: number}} mousePos The position of the mouse relative to the canvas.
     * @returns {{index: number}|null} A target object with the column index if found, otherwise null.
     */
    findResizeTarget(mousePos) {
        if (mousePos.y > this.grid.headerHeight) return null;

        let currentX = this.grid.headerWidth;
        for (let c = 0; c < this.grid.cols; c++) {
            currentX += this.grid.colWidths[c];
            const edgeX = currentX - this.grid.scrollX;

            if (Math.abs(mousePos.x - edgeX) < this.handleSize) {
                return { index: c };
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
            this.targetColumnIndex = target.index;
            this.resizeStartPos = event.clientX;
            this.originalWidth = this.grid.getColWidth(this.targetColumnIndex);

            // Add listeners to the window to capture drag movement anywhere on the page
            window.addEventListener('mousemove', this.boundHandleMouseMove);
            window.addEventListener('mouseup', this.boundHandleMouseUp);

            event.stopPropagation(); // Prevent other actions like cell selection
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
            // --- ACTIVE RESIZING LOGIC ---
            const deltaX = event.clientX - this.resizeStartPos;
            let newWidth = this.originalWidth + deltaX;
            newWidth = Math.max(20, newWidth); // Enforce minimum width

            this.grid.setColumnWidth(this.targetColumnIndex, newWidth);
            return true; // Actively resizing
        } else {
            // --- HOVER LOGIC (for setting cursor) ---
            const mousePos = { x: event.offsetX, y: event.offsetY };
            if (this.findResizeTarget(mousePos)) {
                this.grid.setCursor('col-resize');
                return true; // Found a handle, cursor is set
            }
        }
        return false; // Not over a handle
    }

    /**
     * 4. MouseUp Handler: Ends the resize operation.
     * @param {MouseEvent} event The mouse up event.
     */
    handleMouseUp(event) {
        if (this.isResizing) {
            this.isResizing = false;
            this.targetColumnIndex = null;

            // Clean up window listeners
            window.removeEventListener('mousemove', this.boundHandleMouseMove);
            window.removeEventListener('mouseup', this.boundHandleMouseUp);

            this.grid.updateScrollbarContentSize();
        }
    }
}