export default class SelectionHandler {
    /**
     * Intializes select handlers
     * @param {Grid} grid Grid
     */
    constructor(grid) {
        this.grid = grid;
        this.isSelecting = false;
        this.selectionType = null;
        this.selectionStartCell = null;
        this.selectionBeforeDrag = new Set();
        this.isAutoScrolling = false;
        this.autoScrollDirection = { x: 0, y: 0 };
        this.scrollLoopId = null;
        this.lastMousePos = { x: 0, y: 0 };
        this.boundScrollLoop = this.scrollLoop.bind(this);
    }
    
    /**
     * Initializes Selection on Mouse action
     * @param {Event} event Mouse Down Event 
     * @returns Null
     */
    handleMouseDown(event) {
        if (this.grid.resizeHandler.resizeTarget) return;

        const rect = this.grid.canvas.getBoundingClientRect();
        this.lastMousePos = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        const isShift = event.shiftKey;
        const isExtend = event.ctrlKey || event.metaKey;

        const clickedCol = this.grid.colAtX(this.lastMousePos.x + this.grid.scrollX);
        const clickedRow = this.grid.rowAtY(this.lastMousePos.y + this.grid.scrollY);
        
        if (!clickedRow || !clickedCol) return;

        const isHeaderClick = this.lastMousePos.y < this.grid.headerHeight || this.lastMousePos.x < this.grid.headerWidth;

        if (isHeaderClick) {
            this.handleHeaderClick(this.lastMousePos, clickedRow, clickedCol, isExtend);
        } else {
            this.handleCellClick(clickedRow, clickedCol, isShift);
        }

        this.grid.requestRedraw();
    }
    
    /**
     * Handles Header click
     * @param {Number} mousePos Mouse position
     * @param {Number} row Row Number
     * @param {Number} col Column Number
     * @param {Boolean} isExtend Extend Selection Yes || No
     */
    handleHeaderClick(mousePos, row, col, isExtend) {
        this.grid.selectionArea = null;
        this.grid.activeCell = null;

        if (mousePos.y < this.grid.headerHeight) {
            this.selectionType = 'col';
            this.selectionStartCell = { row, col };
        } else {
            this.selectionType = 'row';
            this.selectionStartCell = { row, col };
        }
        
        this.isSelecting = true;
        const targetSet = this.selectionType === 'col' ? this.grid.selectedColumns : this.grid.selectedRows;

        if (isExtend) {
            this.selectionBeforeDrag = new Set(targetSet);
        } else {
            this.selectionBeforeDrag.clear();
            this.grid.selectedColumns.clear();
            this.grid.selectedRows.clear();
        }
        
        this.updateHeaderSelection(this.selectionType === 'col' ? col : row);
        this.grid.addSelectionWindowListeners();
    }
    
    /**
     * Handles cell selection
     * @param {Number} row Row Number
     * @param {Number} col Column Number
     * @param {Boolean} isShift Shift selection columns and rows
     */
    handleCellClick(row, col, isShift) {
        this.grid.selectedColumns.clear();
        this.grid.selectedRows.clear();

        this.selectionType = 'cell';
        this.isSelecting = true;

        if (isShift && this.grid.activeCell) {
            this.grid.selectionArea = {
                start: this.grid.activeCell,
                end: { row, col }
            };
            this.isSelecting = false;
        } else {
            this.grid.activeCell = { row, col };
            this.grid.selectionArea = {
                start: { row, col },
                end: { row, col }
            };
            this.grid.addSelectionWindowListeners();
        }
    }
    
    /**
     * Selection on Mouse drag
     * @param {Event} event Mouse Move Event 
     * @returns Null
     */
    handleMouseMove(event) {
        if (!this.isSelecting) return;

        const rect = this.grid.canvas.getBoundingClientRect();
        this.lastMousePos = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        
        this.updateSelectionBasedOnMouse();
        this.checkForAutoScroll();
    }
    
    /**
     * Ends Selection
     */
    handleMouseUp() {
        if (this.isSelecting) {
            this.stopAutoScroll();
            this.isSelecting = false;
            this.selectionType = null;
            this.selectionStartCell = null;
            this.selectionBeforeDrag.clear();
            this.grid.removeSelectionWindowListeners();
        }
    }
    
    /**
     * Updates selected Rows and Columns
     * @param {Number} endIndex Last selected header
     */
    updateHeaderSelection(endIndex) {
        const start = this.selectionType === 'col' ? this.selectionStartCell.col : this.selectionStartCell.row;
        const rangeStart = Math.min(start, endIndex);
        const rangeEnd = Math.max(start, endIndex);
        const currentDragRange = new Set();
        for (let i = rangeStart; i <= rangeEnd; i++) {
            currentDragRange.add(i);
        }

        const targetSet = this.selectionType === 'col' ? this.grid.selectedColumns : this.grid.selectedRows;
        targetSet.clear();

        for (const item of this.selectionBeforeDrag) targetSet.add(item);
        for (const item of currentDragRange) targetSet.add(item);
    }
    
    /**
     * Redraws on selection
     */
    updateSelectionBasedOnMouse() {
        if (this.selectionType === 'cell') {
            const row = this.grid.rowAtY(this.lastMousePos.y + this.grid.scrollY);
            const col = this.grid.colAtX(this.lastMousePos.x + this.grid.scrollX);
            if (row && col) {
                this.grid.selectionArea.end = { row, col };
                this.grid.requestRedraw();
            }
        } else {
            const currentTargetIndex = this.selectionType === 'col'
                ? this.grid.colAtX(this.lastMousePos.x + this.grid.scrollX)
                : this.grid.rowAtY(this.lastMousePos.y + this.grid.scrollY);

            if (currentTargetIndex !== null) {
                this.updateHeaderSelection(currentTargetIndex);
                this.grid.requestRedraw();
            }
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
            if (!this.isAutoScrolling) {
                this.startAutoScroll();
            }
        } else {
            if (this.isAutoScrolling) {
                this.stopAutoScroll();
            }
        }
    }
    
    /**
     * Starts Auto Scroll
     * @returns Null
     */
    startAutoScroll() {
        if (this.isAutoScrolling) return;
        this.isAutoScrolling = true;
        this.scrollLoopId = requestAnimationFrame(this.boundScrollLoop);
    }
    
    /**
     * Stops Auto Scroll
     * @returns Null
     */
    stopAutoScroll() {
        if (!this.isAutoScrolling) return;
        this.isAutoScrolling = false;
        cancelAnimationFrame(this.scrollLoopId);
        this.scrollLoopId = null;
    }
    
    /**
     * Continues Auto Scrolling
     * @returns Null
     */
    scrollLoop() {
        if (!this.isAutoScrolling) return;

        const scrollAmount = 10;
        let newScrollX = this.grid.scrollX + (this.autoScrollDirection.x * scrollAmount);
        let newScrollY = this.grid.scrollY + (this.autoScrollDirection.y * scrollAmount);

        this.grid.scrollX = Math.max(0, Math.min(newScrollX, this.grid.getMaxScrollX()));
        this.grid.scrollY = Math.max(0, Math.min(newScrollY, this.grid.getMaxScrollY()));

        this.grid.hScrollbar.scrollLeft = this.grid.scrollX;
        this.grid.vScrollbar.scrollTop = this.grid.scrollY;

        this.updateSelectionBasedOnMouse();
        this.scrollLoopId = requestAnimationFrame(this.boundScrollLoop);
    }
}