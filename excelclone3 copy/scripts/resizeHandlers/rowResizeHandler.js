export default class RowResizeHandler {
    /**
     * Intializes Row Resize Handler 
     * @param {import('./grid').default} grid 
     */
    constructor(grid) {
        this.grid = grid;
        this.canvas = grid.canvas;
        this.handleSize = 4;

        this.isResizing = false;
        this.targetRowIndex = null;
        this.resizeStartPos = 0;
        this.originalHeight = 0;
        this.onComplete = null;

        this.boundHandleMouseMove = this.handleMouseMove.bind(this);
        this.boundHandleMouseUp = this.handleMouseUp.bind(this);
    }
    
    /**
     * A function to test if Row Resize has to be done based on Mouse pointer position
     * @param {{x: number, y: number}} mousePos Position of mouse pointer relative to pointer 
     * @returns {({index: number} | null)} An object containing the index of the row to be resized if the mouse is on a divider, otherwise null.
     */
    hitTest(mousePos) {
    if (mousePos.x > this.grid.headerWidth) return null;

    let currentTop = this.grid.headerHeight;
    for (let r = 1; r < this.grid.rows; r++) {
        const bottomEdge = currentTop + this.grid.rowHeights[r];
        const onScreenEdge = bottomEdge - this.grid.scrollY;
        
        if (Math.abs(mousePos.y - onScreenEdge) < this.handleSize) {
            return { index: r  };
        }

        currentTop = bottomEdge;
    }

    return null;
    }
    
    /**
     * Handles the mouse down event to start a row resize operation.
     * @param {MouseEvent} event The mouse down event.
     * @param {function(): void} onComplete A callback function to execute when the resize operation is complete.
     * @param {{index: number}} hitResult An object containing the index of the column to be resized.
     */
    handleMouseDown(event, onComplete, hitResult) {
        this.isResizing = true;
        this.onComplete = onComplete;
        this.targetRowIndex = hitResult.index;
        this.resizeStartPos = event.clientY;
        this.originalHeight = this.grid.getRowHeight(this.targetRowIndex);
        
       
        window.addEventListener('mousemove', this.boundHandleMouseMove);
        window.addEventListener('mouseup', this.boundHandleMouseUp);

        event.stopPropagation();
        event.preventDefault();
    }
    
    /**
     * Handles the mouse move event to update the row width during a resize.
     * @param {MouseEvent} event The mouse move event.
     */
    handleMouseMove(event) {
        const deltaY = event.clientY - this.resizeStartPos;
        let newHeight = this.originalHeight + deltaY;
        newHeight = Math.max(20, newHeight);

        this.grid.setRowHeight(this.targetRowIndex, newHeight);
       

    }
    
    /**
     * Handles the mouse event to end row resizing.
     * @param {MouseEvent} event The mouse up event. 
     */
    handleMouseUp(event) {
        if (this.isResizing) {
            this.isResizing = false;
            this.targetRowIndex = null;

            
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