export default class ResizeHandler {
    constructor(grid) {
        this.grid = grid;
        this.canvas = grid.canvas;

        this.isResizing = false;
        this.resizeTarget = null;
        this.resizeStartPos = { x: 0, y: 0 };
        this.originalSize = 0;
        this.resizeHandleSize = 4;
        
        this.boundHandleMouseMove = this.handleMouseMove.bind(this);
        this.boundHandleMouseDown = this.handleMouseDown.bind(this);
        this.boundHandleMouseUp = this.handleMouseUp.bind(this);
        this.boundHandleMouseLeave = this.handleMouseLeave.bind(this);
    }

    addWindowListeners() {
        window.addEventListener('mousemove', this.boundHandleMouseMove);
        window.addEventListener('mouseup', this.boundHandleMouseUp);
    }

    removeWindowListeners() {
        window.removeEventListener('mousemove', this.boundHandleMouseMove);
        window.removeEventListener('mouseup', this.boundHandleMouseUp);
    }

    handleMouseDown(event) {
        if (this.resizeTarget) {
            this.isResizing = true;
            this.resizeStartPos = { x: event.clientX, y: event.clientY };
            
            if (this.resizeTarget.type === 'col') {
                this.originalSize = this.grid.getColWidth(this.resizeTarget.index);
            } else {
                this.originalSize = this.grid.getRowHeight(this.resizeTarget.index);
            }

            this.addWindowListeners();
        }
    }

    handleMouseMove(event) {
        if (this.isResizing) {
            let newSize;
            if (this.resizeTarget.type === 'col') {
                const deltaX = event.clientX - this.resizeStartPos.x;
                newSize = this.originalSize + deltaX;
                newSize = Math.max(20, newSize);
                this.grid.setColumnWidth(this.resizeTarget.index, newSize);
            } else {
                const deltaY = event.clientY - this.resizeStartPos.y;
                newSize = this.originalSize + deltaY;
                newSize = Math.max(20, newSize);
                this.grid.setRowHeight(this.resizeTarget.index, newSize);
            }
        } else {
            const rect = this.canvas.getBoundingClientRect();
            const mousePos = {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };

            const colTarget = this.getColResizeTarget(mousePos);
            if (colTarget) {
                this.resizeTarget = colTarget;
                this.grid.setCursor('col-resize');
                return;
            }

            const rowTarget = this.getRowResizeTarget(mousePos);
            if (rowTarget) {
                this.resizeTarget = rowTarget;
                this.grid.setCursor('row-resize');
                return;
            }

            this.resizeTarget = null;
            this.grid.setCursor('default');
        }
    }

    handleMouseUp() {
        if (this.isResizing) {
            this.isResizing = false;
            this.removeWindowListeners();
            this.grid.updateScrollbarContentSize();
        }
    }

    handleMouseLeave() {
        if (!this.isResizing) {
            this.resizeTarget = null;
            this.grid.setCursor('default');
        }
    }

    getColResizeTarget(mousePos) {
        if (mousePos.y > this.grid.headerHeight) return null;
        let currentX = this.grid.headerWidth;
        for (let c = 1; c < this.grid.cols; c++) {
            currentX += this.grid.colWidths[c];
            const edgeX = currentX - this.grid.scrollX;
            if (Math.abs(mousePos.x - edgeX) < this.resizeHandleSize) {
                return { type: 'col', index: c };
            }
        }
        return null;
    }

    getRowResizeTarget(mousePos) {
        if (mousePos.x > this.grid.headerWidth) return null;
        let currentY = this.grid.headerHeight;
        for (let r = 1; r < this.grid.rows; r++) {
            currentY += this.grid.rowHeights[r];
            const edgeY = currentY - this.grid.scrollY;
            if (Math.abs(mousePos.y - edgeY) < this.resizeHandleSize) {
                return { type: 'row', index: r };
            }
        }
        return null;
    }
}