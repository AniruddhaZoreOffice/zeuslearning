
import RangeSelector from './selectionHandlers/rangeSelector.js';
import ColumnSelector from './selectionHandlers/columnSelector.js';
import RowSelector from './selectionHandlers/rowSelector.js';

export default class SelectionHandler {
    /**
     * Intializes select handlers
     * @param {import('./grid').default} grid Grid
     */
    constructor(grid) {
        this.grid = grid;

        this.rangeSelector = new RangeSelector(grid);
        this.columnSelector = new ColumnSelector(grid);
        this.rowSelector = new RowSelector(grid);

        this.isSelecting = false;
        this.activeSelector = null;

        this.isAutoScrolling = false;
        this.autoScrollDirection = { x: 0, y: 0 };
        this.scrollLoopId = null;
        this.lastMousePos = { x: 0, y: 0 };
        this.boundScrollLoop = this.scrollLoop.bind(this);
    }

    /**
     * Clears all types of selections.
     */
    clearAllSelections() {
        console.log("starting clear")
        this.grid.selectedColumns.clear();
        this.grid.selectedRows.clear();
        this.grid.selectionArea = null;
        this.grid.activeCell = null;
    }
    
    isClickOnSelection(row, col) {
        // Check for full column selection
        if (this.grid.selectedColumns.has(col) && this.grid.selectedRows.size === 0) {
            return true;
        }

        // Check for full row selection
        if (this.grid.selectedRows.has(row) && this.grid.selectedColumns.size === 0) {
            return true;
        }

        // Check for range selection
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
        
        if (!clickedRow || !clickedCol) return;
        
        const isColHeaderClick = this.lastMousePos.y < this.grid.headerHeight && this.lastMousePos.x > this.grid.headerWidth;
        const isRowHeaderClick = this.lastMousePos.x < this.grid.headerWidth && this.lastMousePos.y > this.grid.headerHeight;

        let shouldStartDragging = false;
        const isExtend = event.ctrlKey || event.metaKey;

        if (!isExtend && !event.shiftKey ) {
             if (this.isClickOnSelection(clickedRow, clickedCol)) {
             this.grid.activeCell = { row: clickedRow, col: clickedCol };
             this.grid.requestRedraw();
             return
            } else {
              this.clearAllSelections();    
            }
        }

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
            this.grid.addSelectionWindowListeners();
        }

        this.grid.requestRedraw();
    }
    
    /**
     * Updates selection on Mouse drag via the active selector.
     * @param {Event} event Mouse Move Event 
     */
    handleMouseMove(event) {
        if (!this.isSelecting || !this.activeSelector) return;

        const rect = this.grid.canvas.getBoundingClientRect();
        this.lastMousePos = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        
        this.activeSelector.update(this.lastMousePos);
        this.checkForAutoScroll();
    }
    
    /**
     * Ends Selection.
     */
    handleMouseUp() {
        console.log("reached")
        if (this.isSelecting) {
            if (this.activeSelector) {
                this.activeSelector.end();
            }
            this.stopAutoScroll();
            this.isSelecting = false;
            this.activeSelector = null;
            this.grid.removeSelectionWindowListeners();
        }
    }
    
    /**
     * Checks if Auto scroll is needed
     */
    checkForAutoScroll() {
        const zoneSize = 50;
        const canvas = this.grid.canvas;
        const dpr = this.grid.getDPR();
        const canvasWidth = canvas.width / dpr;
        const canvasHeight = canvas.height / dpr;

        let direction = { x: 0, y: 0 };
        if (this.lastMousePos.x < zoneSize) direction.x = -1;
        else if (this.lastMousePos.x > canvasWidth - zoneSize) direction.x = 1;
        if (this.lastMousePos.y < zoneSize) direction.y = -1;
        else if (this.lastMousePos.y > canvasHeight - zoneSize) direction.y = 1;
        
        this.autoScrollDirection = direction;

        if (direction.x !== 0 || direction.y !== 0) {
            if (!this.isAutoScrolling) this.startAutoScroll();
        } else {
            if (this.isAutoScrolling) this.stopAutoScroll();
        }
    }
    
    startAutoScroll() {
        if (this.isAutoScrolling) return;
        this.isAutoScrolling = true;
        this.scrollLoopId = requestAnimationFrame(this.boundScrollLoop);
    }
    
    stopAutoScroll() {
        if (!this.isAutoScrolling) return;
        this.isAutoScrolling = false;
        cancelAnimationFrame(this.scrollLoopId);
        this.scrollLoopId = null;
    }
    
    scrollLoop() {
        if (!this.isAutoScrolling || !this.activeSelector) return;

        const scrollAmount = 10;
        let newScrollX = this.grid.scrollX + (this.autoScrollDirection.x * scrollAmount);
        let newScrollY = this.grid.scrollY + (this.autoScrollDirection.y * scrollAmount);

        this.grid.scrollX = Math.max(0, Math.min(newScrollX, this.grid.getMaxScrollX()));
        this.grid.scrollY = Math.max(0, Math.min(newScrollY, this.grid.getMaxScrollY()));

        this.grid.hScrollbar.scrollLeft = this.grid.scrollX;
        this.grid.vScrollbar.scrollTop = this.grid.scrollY;

        this.activeSelector.update(this.lastMousePos);
        this.scrollLoopId = requestAnimationFrame(this.boundScrollLoop);
    }
}