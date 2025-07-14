export default class ColumnSelector {
    constructor(grid, autoScroller) {
        this.grid = grid;
        this.autoScroller = autoScroller;
        this.isSelecting = false;
        this.startCol = null;
        this.selectionBeforeDrag = new Set();
        this.lastMousePos = { x: 0, y: 0 };
        this.onComplete = null;
        this.rafId = null;

        this.boundSelectionLoop = this.selectionLoop.bind(this);
        this.boundHandleMouseMove = this.handleMouseMove.bind(this);
        this.boundHandleMouseUp = this.handleMouseUp.bind(this);
    }

    hitTest(mousePos) {
        return mousePos.y < this.grid.headerHeight && mousePos.x > this.grid.headerWidth;
    }

    handleMouseDown(event, onComplete) {
        this.onComplete = onComplete;
        this.lastMousePos = { x: event.offsetX, y: event.offsetY };

        const clickedCol = this.grid.colAtX(this.lastMousePos.x + this.grid.scrollX);
        if (clickedCol === null) {
            if (this.onComplete) this.onComplete();
            return;
        }

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

        this.grid.activeCell = { row: 1, col: clickedCol };
        this.updateSelection(clickedCol);

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

        const currentCol = this.grid.colAtX(this.lastMousePos.x + this.grid.scrollX);
        this.updateSelection(currentCol);
        
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

            this.startCol = null;
            this.selectionBeforeDrag.clear();

            window.removeEventListener('mousemove', this.boundHandleMouseMove);
            window.removeEventListener('mouseup', this.boundHandleMouseUp);

            if (this.onComplete) {
                this.onComplete();
            }
            this.onComplete = null;
        }
    }

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
    }
}