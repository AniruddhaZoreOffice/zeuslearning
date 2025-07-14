export default class RangeSelector {
    constructor(grid, autoScroller) {
        this.grid = grid;
        this.autoScroller = autoScroller;
        this.isSelecting = false;
        this.lastMousePos = { x: 0, y: 0 };
        this.onComplete = null;
        this.rafId = null; 
        this.boundSelectionLoop = this.selectionLoop.bind(this);
        this.boundHandleMouseMove = this.handleMouseMove.bind(this);
        this.boundHandleMouseUp = this.handleMouseUp.bind(this);
    }

    hitTest(mousePos) {
        return mousePos.x > this.grid.headerWidth && mousePos.y > this.grid.headerHeight;
    }

    handleMouseDown(event, onComplete) {
        this.onComplete = onComplete;
        this.lastMousePos = { x: event.offsetX, y: event.offsetY };

        const clickedRow = this.grid.rowAtY(this.lastMousePos.y + this.grid.scrollY);
        const clickedCol = this.grid.colAtX(this.lastMousePos.x + this.grid.scrollX);

        if (clickedRow === null || clickedCol === null) {
            if (this.onComplete) this.onComplete();
            return;
        }
        
        const isExtend = event.ctrlKey || event.metaKey;
        if (!isExtend && !event.shiftKey) {
            this.grid.selectedColumns.clear();
            this.grid.selectedRows.clear();
        }

        this.grid.activeCell = { row: clickedRow, col: clickedCol };

        if (event.shiftKey && this.grid.selectionArea?.start) {
            this.grid.selectionArea.end = { row: clickedRow, col: clickedCol };
            this.normalizeSelectionArea();
            this.grid.requestRedraw();
            if (this.onComplete) this.onComplete();
        } else {
            this.isSelecting = true;
            this.grid.selectionArea = {
                start: this.grid.activeCell,
                end: this.grid.activeCell
            };
            
            window.addEventListener('mousemove', this.boundHandleMouseMove);
            window.addEventListener('mouseup', this.boundHandleMouseUp);
            this.selectionLoop();
        }
    }

    handleMouseMove(event) {
        if (event) {
            const rect = this.grid.canvas.getBoundingClientRect();
            this.lastMousePos = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        }
    }

    
    selectionLoop() {
        if (!this.isSelecting) return; 

        const endRow = this.grid.rowAtY(this.lastMousePos.y + this.grid.scrollY);
        const endCol = this.grid.colAtX(this.lastMousePos.x + this.grid.scrollX);

        if (endRow !== null && endCol !== null) {
            const currentEnd = this.grid.selectionArea.end;
            if (endRow !== currentEnd.row || endCol !== currentEnd.col) {
                this.grid.selectionArea.end = { row: endRow, col: endCol };
            }
        }
      
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

            window.removeEventListener('mousemove', this.boundHandleMouseMove);
            window.removeEventListener('mouseup', this.boundHandleMouseUp);
            
            this.normalizeSelectionArea();
            this.grid.requestRedraw();
            
            if (this.onComplete) {
                this.onComplete();
            }
            this.onComplete = null;
        }
    }

    normalizeSelectionArea() {
        if (!this.grid.selectionArea) return;
        const { start, end } = this.grid.selectionArea;

        this.grid.selectionArea = {
            start: { row: Math.min(start.row, end.row), col: Math.min(start.col, end.col) },
            end: { row: Math.max(start.row, end.row), col: Math.max(start.col, end.col) }
        };
    }
}