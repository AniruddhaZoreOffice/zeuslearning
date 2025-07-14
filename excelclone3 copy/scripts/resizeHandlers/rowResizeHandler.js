export default class RowResizeHandler {
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

    handleMouseMove(event) {
        const deltaY = event.clientY - this.resizeStartPos;
        let newHeight = this.originalHeight + deltaY;
        newHeight = Math.max(20, newHeight);

        this.grid.setRowHeight(this.targetRowIndex, newHeight);
       

    }

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