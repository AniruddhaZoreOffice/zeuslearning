/**
 * Manages the selection of entire rows by clicking and dragging within the row header area.
 * It handles mouse events to update the set of selected rows and supports auto-scrolling.
 */
export default class RowSelector {
    /**
     * Initializes the RowSelector.
     * @param {Grid} grid - The main grid instance this selector will operate on.
     * @param {AutoScroller} autoScroller - The utility for handling auto-scrolling during selection.
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
         * A boolean flag indicating if a row selection drag is currently in progress.
         * @type {boolean}
         */
        this.isSelecting = false;

        /**
         * The index of the row where the selection drag started.
         * @type {?number}
         */
        this.startRow = null;

        /**
         * A snapshot of the selected rows before a new drag operation begins, used for extending selections.
         * @type {Set<number>}
         */
        this.selectionBeforeDrag = new Set();

        /**
         * The last recorded mouse position relative to the canvas.
         * @type {{x: number, y: number}}
         */
        this.lastMousePos = { x: 0, y: 0 };

        /**
         * A callback function to be executed when the selection process is complete.
         * @type {?function}
         */
        this.onComplete = null;

        /**
         * The ID of the current requestAnimationFrame loop.
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
     * Checks if the mouse position is within the grid's row header area.
     * @param {{x: number, y: number}} mousePos - The mouse position to test.
     * @returns {boolean} True if the position is inside the row header area, false otherwise.
     */
    hitTest(mousePos) {
        return mousePos.x < this.grid.headerWidth && mousePos.y > this.grid.headerHeight;
    }

    /**
     * Handles the mouse down event in the row header to initiate row selection.
     * @param {MouseEvent} event - The native mouse down event.
     * @param {function} onComplete - A callback to execute when the selection is finalized.
     * @returns {void}
     */
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
     * The main loop for handling drag-selection of rows, run via requestAnimationFrame.
     * It updates the selected rows based on the mouse position and triggers auto-scrolling.
     * @returns {void}
     */
     selectionLoop() {
        if (!this.isSelecting) return;

        const currentRow = this.grid.rowAtY(this.lastMousePos.y + this.grid.scrollY);
        this.updateSelection(currentRow);
        
        // THIS IS THE FIX: Disable horizontal scrolling for row selection
        this.autoScroller.check(this.lastMousePos, { horizontal: false });
        
        this.grid.requestRedraw();

        this.rafId = requestAnimationFrame(this.boundSelectionLoop);
    }

    /**
     * Handles the mouse up event to finalize the row selection process.
     * It stops the selection loop and cleans up event listeners and state.
     * @param {MouseEvent} event - The native mouse up event.
     * @returns {void}
     */
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

    /**
     * Updates the grid's set of selected rows based on the drag range.
     * It combines the selection state from before the drag with the new range of rows being dragged over.
     * @param {?number} endRow - The current row index under the mouse cursor.
     * @returns {void}
     */
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