export default class ColumnResizeHandler {
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

    handleMouseMove(event) {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }

        // Schedule the actual resize logic to run on the next animation frame
        this.rafId = requestAnimationFrame(() => {
        const deltaX = event.clientX - this.resizeStartPos;
        let newWidth = this.originalWidth + deltaX;
        newWidth = Math.max(20, newWidth);
        this.grid.setColumnWidth(this.targetColumnIndex, newWidth);})
    }

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