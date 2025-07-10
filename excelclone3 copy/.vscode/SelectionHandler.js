import RangeSelector from './selectionHandlers/rangeSelector.js';
import ColumnSelector from './selectionHandlers/columnSelector.js';
import RowSelector from './selectionHandlers/rowSelector.js';
import AutoScroller from './autoscroller.js'; 

export default class SelectionHandler {
    /**
     * Initializes select handlers
     * @param {import('./grid').default} grid Grid
     */
    constructor(grid) {
        this.grid = grid;

        this.rangeSelector = new RangeSelector(grid);
        this.columnSelector = new ColumnSelector(grid);
        this.rowSelector = new RowSelector(grid);

        this.autoScroller = new AutoScroller(grid, this.onAutoScroll.bind(this));

        this.isSelecting = false;
        this.activeSelector = null;
        this.lastMousePos = { x: 0, y: 0 };
    }

    /**
     * Clears all types of selections.
     */
    clearAllSelections() {
        this.grid.selectedColumns.clear();
        this.grid.selectedRows.clear();
        this.grid.selectionArea = null;
        this.grid.activeCell = null;
    }
    
    isClickOnSelection(row, col) {
        if (this.grid.selectedColumns.has(col) && this.grid.selectedRows.size === 0) return true;
        if (this.grid.selectedRows.has(row) && this.grid.selectedColumns.size === 0) return true;
        
        if (this.grid.selectionArea) {
            const { start, end } = this.grid.selectionArea;
            const minRow = Math.min(start.row, end.row);
            const maxRow = Math.max(start.row, end.row);
            const minCol = Math.min(start.col, end.col);
            const maxCol = Math.max(start.col, end.col);
            if (row >= minRow && row <= maxRow && col >= minCol && col <= maxCol) {
                return true;
            }
        }
        return false;
    }

    /**
     * Initializes Selection on Mouse action by delegating to the correct handler.
     * @param {Event} event Mouse Down Event 
     */
    handleMouseDown(event) {
        if (this.grid.resizeHandler.isResizing || this.grid.resizeHandler.resizeTarget) return;

        const rect = this.grid.canvas.getBoundingClientRect();
        this.lastMousePos = { x: event.clientX - rect.left, y: event.clientY - rect.top };

        const clickedCol = this.grid.colAtX(this.lastMousePos.x + this.grid.scrollX);
        const clickedRow = this.grid.rowAtY(this.lastMousePos.y + this.grid.scrollY);
        
        if (clickedRow === null || clickedCol === null) return;
        
        const isColHeaderClick = this.lastMousePos.y < this.grid.headerHeight && this.lastMousePos.x > this.grid.headerWidth;
        const isRowHeaderClick = this.lastMousePos.x < this.grid.headerWidth && this.lastMousePos.y > this.grid.headerHeight;
        const isExtend = event.ctrlKey || event.metaKey;

        if (!isExtend && !event.shiftKey) {
            this.clearAllSelections();
        }

        if (isColHeaderClick) {
            this.grid.activeCell = { row: 1, col: clickedCol }; 
        } else if (isRowHeaderClick) {
            this.grid.activeCell = { row: clickedRow, col: 1 }; 
        } else {
            this.grid.activeCell = { row: clickedRow, col: clickedCol };
        }

        let shouldStartDragging = false;
        
        if (isColHeaderClick) {
            if (!isExtend) { this.grid.selectedRows.clear(); this.grid.selectionArea = null; }
            this.activeSelector = this.columnSelector;
            this.activeSelector.start(event, clickedCol);
            shouldStartDragging = true;
        } else if (isRowHeaderClick) {
            if (!isExtend) { this.grid.selectedColumns.clear(); this.grid.selectionArea = null; }
            this.activeSelector = this.rowSelector;
            this.activeSelector.start(event, clickedRow);
            shouldStartDragging = true;
        } else {
             if (!event.shiftKey) {
                this.grid.selectedColumns.clear();
                this.grid.selectedRows.clear();
             }
            this.activeSelector = this.rangeSelector;
            shouldStartDragging = this.activeSelector.start(event, clickedRow, clickedCol);
        }

        if (shouldStartDragging) {
            this.isSelecting = true;
        }

        this.grid.requestRedraw();
    }
    
    /**
     * Updates selection and checks for auto-scrolling during a mouse drag.
     * @param {Event} event Mouse Move Event 
     */
    handleMouseMove(event) {
        if (!this.isSelecting || !this.activeSelector) return;

        const rect = this.grid.canvas.getBoundingClientRect();
        this.lastMousePos = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        
        this.activeSelector.update(this.lastMousePos);
        
        this.autoScroller.check(this.lastMousePos);
    }
    
    /**
     * Ends the selection process.
     */
    handleMouseUp() {
        if (this.isSelecting) {
            if (this.activeSelector) {
                this.activeSelector.end();
            }
           
            this.autoScroller.stop();

            this.isSelecting = false;
            this.activeSelector = null;
            this.grid.requestRedraw();
        }
    }

    /**
     * This callback is passed to the AutoScroller. It's called on each
     * frame of an auto-scroll, ensuring the selection range keeps expanding.
     */
    onAutoScroll() {
        if (this.activeSelector) {
            this.activeSelector.update(this.lastMousePos);
        }
    }
}