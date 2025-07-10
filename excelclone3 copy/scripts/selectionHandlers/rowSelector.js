export default class RowSelector {
    /**
     * @param {import('../grid').default} grid The grid instance
     * @param {import('../autoscroller').default} autoScroller A shared AutoScroller instance
     */
    constructor(grid, autoScroller) {
        this.grid = grid;
        this.autoScroller = autoScroller;
        this.isSelecting = false;
        this.startRow = null;
        this.selectionBeforeDrag = new Set();
        this.lastMousePos = { x: 0, y: 0 };

        this.boundHandleMouseMove = this.handleMouseMove.bind(this);
        this.boundHandleMouseUp = this.handleMouseUp.bind(this);
    }

    /**
     * 1. Hit-Test Function: Checks if a mouse position is within the row header area.
     * @param {{x: number, y: number}} mousePos
     * @returns {boolean}
     */
    hitTest(mousePos) {
        return mousePos.x < this.grid.headerWidth && mousePos.y > this.grid.headerHeight;
    }

    /**
     * 2. MouseDown Handler: Starts a row selection.
     * @param {MouseEvent} event
     */
    handleMouseDown(event) {
        const mousePos = { x: event.offsetX, y: event.offsetY };
        if (!this.hitTest(mousePos)) return;

        const clickedRow = this.grid.rowAtY(mousePos.y + this.grid.scrollY);
        if (clickedRow === null) return;

        this.isSelecting = true;
        this.startRow = clickedRow;

        const isExtend = event.ctrlKey || event.metaKey;
        if (isExtend) {
            this.selectionBeforeDrag = new Set(this.grid.selectedRows);
        } else {
            this.grid.selectedRows.clear();
            this.grid.selectedColumns.clear();
            this.grid.selectionArea = null;
            this.selectionBeforeDrag.clear();
        }

        this.grid.activeCell = { row: clickedRow, col: 0 };
        this.updateSelection(clickedRow); // Initial update

        window.addEventListener('mousemove', this.boundHandleMouseMove);
        window.addEventListener('mouseup', this.boundHandleMouseUp);
    }

    /**
     * 3. MouseMove Handler: Updates the row selection during a drag.
     * @param {MouseEvent} [event]
     */
    handleMouseMove(event) {
        if (event) {
            const rect = this.grid.canvas.getBoundingClientRect();
            this.lastMousePos = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        }
        if (!this.isSelecting) return;

        const currentRow = this.grid.rowAtY(this.lastMousePos.y + this.grid.scrollY);
        this.updateSelection(currentRow);
        
        this.autoScroller.check(this.lastMousePos, () => this.handleMouseMove());
    }

    /**
     * 4. MouseUp Handler: Finalizes the selection.
     * @param {MouseEvent} event
     */
    handleMouseUp(event) {
        if (this.isSelecting) {
            this.isSelecting = false;
            this.autoScroller.stop();
            this.startRow = null;
            this.selectionBeforeDrag.clear();

            window.removeEventListener('mousemove', this.boundHandleMouseMove);
            window.removeEventListener('mouseup', this.boundHandleMouseUp);
        }
    }

    /** Helper to perform the selection update logic. */
    updateSelection(endRow) {
        if (endRow === null) return;

        const rangeStart = Math.min(this.startRow, endRow);
        const rangeEnd = Math.max(this.startRow, endRow);

        const currentDragRange = new Set();
        for (let i = rangeStart; i <= rangeEnd; i++) {
            currentDragRange.add(i);
        }

        const targetSet = this.grid.selectedRows;
        targetSet.clear();

        for (const item of this.selectionBeforeDrag) targetSet.add(item);
        for (const item of currentDragRange) targetSet.add(item);

        this.grid.requestRedraw();
    }
}