export default class ColumnSelector {
    /**
     * @param {import('../grid').default} grid The grid instance
     * @param {import('../autoscroller').default} autoScroller A shared AutoScroller instance
     */
    constructor(grid, autoScroller) {
        this.grid = grid;
        this.autoScroller = autoScroller;
        this.isSelecting = false;
        this.startCol = null;
        this.selectionBeforeDrag = new Set();
        this.lastMousePos = { x: 0, y: 0 };

        this.boundHandleMouseMove = this.handleMouseMove.bind(this);
        this.boundHandleMouseUp = this.handleMouseUp.bind(this);
    }

    /**
     * 1. Hit-Test Function: Checks if a mouse position is within the column header area.
     * @param {{x: number, y: number}} mousePos
     * @returns {boolean}
     */
    hitTest(mousePos) {
        return mousePos.y < this.grid.headerHeight && mousePos.x > this.grid.headerWidth;
    }

    /**
     * 2. MouseDown Handler: Starts a column selection.
     * @param {MouseEvent} event
     */
    handleMouseDown(event) {
        const mousePos = { x: event.offsetX, y: event.offsetY };
        if (!this.hitTest(mousePos)) return;

        const clickedCol = this.grid.colAtX(mousePos.x + this.grid.scrollX);
        if (clickedCol === null) return;
        
        this.isSelecting = true;
        this.startCol = clickedCol;

        const isExtend = event.ctrlKey || event.metaKey;
        if (isExtend) {
            this.selectionBeforeDrag = new Set(this.grid.selectedColumns);
        } else {
            this.grid.selectedColumns.clear();
            this.grid.selectedRows.clear();
            this.grid.selectionArea = null;
            this.selectionBeforeDrag.clear();
        }
        
        this.grid.activeCell = { row: 0, col: clickedCol };
        this.updateSelection(clickedCol); 

        window.addEventListener('mousemove', this.boundHandleMouseMove);
        window.addEventListener('mouseup', this.boundHandleMouseUp);
    }

    /**
     * 3. MouseMove Handler: Updates the column selection during a drag.
     * @param {MouseEvent} [event]
     */
    handleMouseMove(event) {
        if (event) {
            const rect = this.grid.canvas.getBoundingClientRect();
            this.lastMousePos = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        }
        if (!this.isSelecting) return;
        
        const currentCol = this.grid.colAtX(this.lastMousePos.x + this.grid.scrollX);
        this.updateSelection(currentCol);
        
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
            this.startCol = null;
            this.selectionBeforeDrag.clear();

            window.removeEventListener('mousemove', this.boundHandleMouseMove);
            window.removeEventListener('mouseup', this.boundHandleMouseUp);
        }
    }

    /** Helper to perform the selection update logic. */
    updateSelection(endCol) {
        if (endCol === null) return;

        const rangeStart = Math.min(this.startCol, endCol);
        const rangeEnd = Math.max(this.startCol, endCol);
        
        const currentDragRange = new Set();
        for (let i = rangeStart; i <= rangeEnd; i++) {
            currentDragRange.add(i);
        }

        const targetSet = this.grid.selectedColumns;
        targetSet.clear();

        for (const item of this.selectionBeforeDrag) targetSet.add(item);
        for (const item of currentDragRange) targetSet.add(item);
        
        this.grid.requestRedraw();
    }
}