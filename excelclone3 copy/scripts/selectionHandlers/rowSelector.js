export default class RowSelector {
    constructor(grid, autoScroller) {
        this.grid = grid;
        this.autoScroller = autoScroller;
        this.isSelecting = false;
        this.startRow = null;
        this.selectionBeforeDrag = new Set();
        this.lastMousePos = { x: 0, y: 0 };
        this.onComplete = null;
        this.rafId = null;

        this.boundSelectionLoop = this.selectionLoop.bind(this);
        this.boundHandleMouseMove = this.handleMouseMove.bind(this);
        this.boundHandleMouseUp = this.handleMouseUp.bind(this);
    }

    hitTest(mousePos) {
        return mousePos.x < this.grid.headerWidth && mousePos.y > this.grid.headerHeight;
    }

    handleMouseDown(event, onComplete) {
        this.onComplete = onComplete;
        this.lastMousePos = { x: event.offsetX, y: event.offsetY };
        
        const clickedRow = this.grid.rowAtY(this.lastMousePos.y + this.grid.scrollY);
        if (clickedRow === null) {
            if (this.onComplete) this.onComplete();
            return;
        }

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

        this.grid.activeCell = { row: clickedRow, col: 1 };
        this.updateSelection(clickedRow);

        window.addEventListener('mousemove', this.boundHandleMouseMove);
        window.addEventListener('mouseup', this.boundHandleMouseUp);
        this.selectionLoop();
    }

    handleMouseMove(event) {
        if (event) {
            const rect = this.grid.canvas.getBoundingClientRect();
            this.lastMousePos = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        }
    }

    selectionLoop() {
        if (!this.isSelecting) return;

        const currentRow = this.grid.rowAtY(this.lastMousePos.y + this.grid.scrollY);
        this.updateSelection(currentRow);
        
        this.autoScroller.check(this.lastMousePos);
        
        this.grid.requestRedraw();

        this.rafId = requestAnimationFrame(this.boundSelectionLoop);
    }

    handleMouseUp(event) {
        if (this.isSelecting) {
            this.isSelecting = false;

            cancelAnimationFrame(this.rafId);
            this.rafId = null;
            this.autoScroller.stop();

            this.startRow = null;
            this.selectionBeforeDrag.clear();

            window.removeEventListener('mousemove', this.boundHandleMouseMove);
            window.removeEventListener('mouseup', this.boundHandleMouseUp);
            
            if (this.onComplete) {
                this.onComplete();
            }
            this.onComplete = null;
        }
    }

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
    }
}