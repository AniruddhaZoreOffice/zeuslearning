export default class RangeSelector {
    /**
     * @param {import('../grid').default} grid The grid instance
     * @param {import('../autoscroller').default} autoScroller A shared AutoScroller instance
     */
    constructor(grid, autoScroller) {
        this.grid = grid;
        this.autoScroller = autoScroller;
        this.isSelecting = false;
        this.lastMousePos = { x: 0, y: 0 };

        // Bind methods for window event listeners
        this.boundHandleMouseMove = this.handleMouseMove.bind(this);
        this.boundHandleMouseUp = this.handleMouseUp.bind(this);
    }

    /**
     * 1. Hit-Test Function: Checks if a mouse position is within the main cell area.
     * @param {{x: number, y: number}} mousePos The position of the mouse relative to the canvas.
     * @returns {boolean}
     */
    hitTest(mousePos) {
        return mousePos.x > this.grid.headerWidth && mousePos.y > this.grid.headerHeight;
    }

    /**
     * 2. MouseDown Handler: Starts a cell or range selection.
     * @param {MouseEvent} event
     */
    handleMouseDown(event) {
        const mousePos = { x: event.offsetX, y: event.offsetY };
        if (!this.hitTest(mousePos)) return;

        const clickedRow = this.grid.rowAtY(mousePos.y + this.grid.scrollY);
        const clickedCol = this.grid.colAtX(mousePos.x + this.grid.scrollX);
        if (clickedRow === null || clickedCol === null) return;

        const isExtend = event.ctrlKey || event.metaKey;

        // If not extending, this click should clear any other selection type.
        if (!isExtend && !event.shiftKey) {
            this.grid.selectedColumns.clear();
            this.grid.selectedRows.clear();
        }

        this.grid.activeCell = { row: clickedRow, col: clickedCol };

        if (event.shiftKey && this.grid.selectionArea?.start) {
            // Shift-click extends the selection from the existing active cell.
            this.grid.selectionArea.end = { row: clickedRow, col: clickedCol };
            this.normalizeSelectionArea(); // Finalize immediately
        } else {
            // Normal click/drag starts a new selection area.
            this.isSelecting = true;
            this.grid.selectionArea = {
                start: this.grid.activeCell,
                end: this.grid.activeCell
            };
            // Add listeners to handle dragging anywhere on the page
            window.addEventListener('mousemove', this.boundHandleMouseMove);
            window.addEventListener('mouseup', this.boundHandleMouseUp);
        }
        
        this.grid.requestRedraw();
    }

    /**
     * 3. MouseMove Handler: Updates the selection range during a drag.
     * @param {MouseEvent} [event] The mouse move event (optional, not passed during autoscroll).
     */
    handleMouseMove(event) {
        if (event) {
            const rect = this.grid.canvas.getBoundingClientRect();
            this.lastMousePos = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        }
        
        if (!this.isSelecting || !this.grid.selectionArea) return;
        
        const newRow = this.grid.rowAtY(this.lastMousePos.y + this.grid.scrollY);
        const newCol = this.grid.colAtX(this.lastMousePos.x + this.grid.scrollX);

        if (newRow !== null && newCol !== null) {
            const currentEnd = this.grid.selectionArea.end;
            if (newRow !== currentEnd.row || newCol !== currentEnd.col) {
                this.grid.selectionArea.end = { row: newRow, col: newCol };
                this.grid.requestRedraw();
            }
        }

        this.autoScroller.check(this.lastMousePos, () => this.handleMouseMove());
    }

    /**
     * 4. MouseUp Handler: Finalizes the selection and cleans up listeners.
     * @param {MouseEvent} event
     */
    handleMouseUp(event) {
        if (this.isSelecting) {
            this.isSelecting = false;
            this.autoScroller.stop();
            this.normalizeSelectionArea();
            
            window.removeEventListener('mousemove', this.boundHandleMouseMove);
            window.removeEventListener('mouseup', this.boundHandleMouseUp);
            
            this.grid.requestRedraw();
        }
    }

    /**
     * Helper to ensure the selection area's start/end are min/max.
     */
    normalizeSelectionArea() {
        if (!this.grid.selectionArea) return;
        const { start, end } = this.grid.selectionArea;

        this.grid.selectionArea = {
            start: { row: Math.min(start.row, end.row), col: Math.min(start.col, end.col) },
            end: { row: Math.max(start.row, end.row), col: Math.max(start.col, end.col) }
        };
    }
}