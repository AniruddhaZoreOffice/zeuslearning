export default class ColumnResizeHandler {
    /**
     * Intializes the Column Resize Handler
     * @param {import('./grid').default} grid Grid Instance
     */
    constructor(grid) {
        this.grid = grid;
        this.canvas = grid.canvas;
        this.handleSize = 4;
        this.rafId = null; 

        this.isResizing = false;
        this.targetColumnIndex = null;
        this.resizeStartPos = 0;
        this.originalWidth = 0;
        this.onComplete = null;

        this.boundHandleMouseMove = this.handleMouseMove.bind(this);
        this.boundHandleMouseUp = this.handleMouseUp.bind(this);
    }

    /**
     * A function to test if Column Resize has to be done based on Mouse Position
     * @param {{x: number, y: number}} mousePos Position of Mouse Pointer 
     * @returns {({index: number} | null)} An object containing the index of the column to be resized if the mouse is on a divider, otherwise null.
     */
    hitTest(mousePos) {
        if (mousePos.y > this.grid.headerHeight) return null;
    
        let currentLeft = this.grid.headerWidth; 
        for (let c = 1; c < this.grid.cols; c++) {
           
            const rightEdge = currentLeft + this.grid.colWidths[c];
            const onScreenEdge = rightEdge - this.grid.scrollX;
    
            if (Math.abs(mousePos.x - onScreenEdge) < this.handleSize) {
                return { index: c };
            }
    
            currentLeft = rightEdge;
        }
        
        return null;
    }
    
    /**
     * Handles the mouse down event to start a column resize operation.
     * @param {MouseEvent} event The mouse down event.
     * @param {function(): void} onComplete A callback function to execute when the resize operation is complete.
     * @param {{index: number}} hitResult An object containing the index of the column to be resized.
     * @returns {void}
     */
    handleMouseDown(event, onComplete, hitResult) {
        this.isResizing = true;
        this.onComplete = onComplete;
        this.targetColumnIndex = hitResult.index;
        this.resizeStartPos = event.clientX;
        this.originalWidth = this.grid.getColWidth(this.targetColumnIndex);

        window.addEventListener('mousemove', this.boundHandleMouseMove);
        window.addEventListener('mouseup', this.boundHandleMouseUp);

        event.stopPropagation();
        event.preventDefault();
    }

    /**
     * Handles the mouse move event to update the column width during a resize.
     * @param {MouseEvent} event The mouse move event.
     * @returns {void}
     */
    handleMouseMove(event) {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }

        // Schedule the actual resize logic to run on the next animation frame
        this.rafId = requestAnimationFrame(() => {
        const deltaX = event.clientX - this.resizeStartPos;
        let newWidth = this.originalWidth + deltaX;
        newWidth = Math.max(20, newWidth); // Ensure minimum width
        this.grid.setColumnWidth(this.targetColumnIndex, newWidth);
        this.rafId = null; // Reset rafId after execution
        });
    }

    /**
     * Handles the mouse up event to finalize the column resize operation.
     * Cleans up event listeners and updates the grid's scrollbar content size.
     * @param {MouseEvent} event The mouse up event.
     * @returns {void}
     */
    handleMouseUp(event) {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        if (this.isResizing) {
            this.isResizing = false;
            this.targetColumnIndex = null;
            
            window.removeEventListener('mousemove', this.boundHandleMouseMove);
            window.removeEventListener('mouseup', this.boundHandleMouseUp);
            
            this.grid.updateScrollbarContentSize();
            
            if (this.onComplete) {
                this.onComplete();
            }
            this.onComplete = null;
        }
    }
}