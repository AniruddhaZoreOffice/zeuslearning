export default class RangeSelector {
    /**
     * Initializes the RangeSelector.
     * @param {Grid} grid - The main grid instance this selector will operate on.
     * @param {AutoScroller} autoScroller - An instance of the auto-scroller utility to handle scrolling during selection.
     */
    constructor(grid, autoScroller) {
        /**
         * The grid component instance.
         * @type {Grid}
         */
        this.grid = grid;

        /**
         * The auto-scroller utility instance.
         * @type {AutoScroller}
         */
        this.autoScroller = autoScroller;

        /**
         * A boolean flag indicating if a selection drag is currently in progress.
         * @type {boolean}
         */
        this.isSelecting = false;

        /**
         * The last recorded mouse position relative to the canvas.
         * @type {{x: number, y: number}}
         */
        this.lastMousePos = { x: 0, y: 0 };

        /**
         * A callback function to be executed when the selection process is complete (on mouse up).
         * @type {?function}
         */
        this.onComplete = null;

        /**
         * The ID of the current requestAnimationFrame loop, used for cancelling the animation.
         * @type {?number}
         */
        this.rafId = null; 

        /**
         * A pre-bound version of the selectionLoop method for use with requestAnimationFrame.
         * @type {function}
         */
        this.boundSelectionLoop = this.selectionLoop.bind(this);
        
        /**
         * A pre-bound version of the handleMouseMove method for use with event listeners.
         * @type {function}
         */
        this.boundHandleMouseMove = this.handleMouseMove.bind(this);
        
        /**
         * A pre-bound version of the handleMouseUp method for use with event listeners.
         * @type {function}
         */
        this.boundHandleMouseUp = this.handleMouseUp.bind(this);
    }

    /**
     * Checks if the mouse position is within the grid's data cell area (not headers).
     * @param {{x: number, y: number}} mousePos - The mouse position to test.
     * @returns {boolean} True if the position is inside the data area, false otherwise.
     */
    hitTest(mousePos) {
        return mousePos.x > this.grid.headerWidth && mousePos.y > this.grid.headerHeight;
    }

    /**
     * Handles the mouse down event to initiate a selection.
     * It can start a new selection, add to an existing selection (with Ctrl/Meta), 
     * or extend a selection (with Shift).
     * @param {MouseEvent} event - The native mouse down event.
     * @param {function} onComplete - A callback to execute when the selection is finalized.
     * @returns {void}
     */
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

    /**
     * Updates the last known mouse position during a mouse move event.
     * @param {MouseEvent} event - The native mouse move event.
     * @returns {void}
     */
    handleMouseMove(event) {
        if (event) {
            const rect = this.grid.canvas.getBoundingClientRect();
            this.lastMousePos = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        }
    }

    
    /**
     * The main loop for handling drag-selection, run via requestAnimationFrame.
     * It updates the selection area based on the current mouse position and triggers auto-scrolling.
     * @returns {void}
     */
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


    /**
     * Handles the mouse up event to finalize the selection process.
     * It stops the selection loop, cleans up event listeners, and normalizes the selection area.
     * @param {MouseEvent} event - The native mouse up event.
     * @returns {void}
     */
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

    /**
     * Ensures the selection area's `start` property holds the top-left cell coordinates
     * and the `end` property holds the bottom-right cell coordinates.
     * @returns {void}
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