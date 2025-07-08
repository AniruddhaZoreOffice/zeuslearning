// resizeHandler.js 
import Grid from "./grid.js";
import ColumnResizeHandler from "./resizeHandlers/columnResizeHandler.js";
import RowResizeHandler from "./resizeHandlers/rowResizeHandler.js";

export default class ResizeHandler {
    /**
     * Intializes Resize Handlers
     * @param {Grid} grid Grid
     */
    constructor(grid) {
        this.grid = grid;
        this.canvas = grid.canvas;

        this.colHandler = new ColumnResizeHandler(grid);
        this.rowHandler = new RowResizeHandler(grid);

        this.isResizing = false;
        this.resizeTarget = null;
        this.resizeStartPos = { x: 0, y: 0 };
        this.originalSize = 0;
        
        this.boundHandleMouseMove = this.handleMouseMove.bind(this);
        this.boundHandleMouseDown = this.handleMouseDown.bind(this);
        this.boundHandleMouseUp = this.handleMouseUp.bind(this);
        this.boundHandleMouseLeave = this.handleMouseLeave.bind(this);
    }
    
    /**
     * Adds Mouse Event listeners
     */
    addWindowListeners() {
        window.addEventListener('mousemove', this.boundHandleMouseMove);
        window.addEventListener('mouseup', this.boundHandleMouseUp);
    }
    
    /**
     * Removes Mouse Event listeners
     */
    removeWindowListeners() {
        window.removeEventListener('mousemove', this.boundHandleMouseMove);
        window.removeEventListener('mouseup', this.boundHandleMouseUp);
    }
    
    /**
     * Initializes Resizing on Mouse action
     * @param {Event} event Mouse Down Event
     */
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
    
    /**
     * Determines cursor styles for non-resize areas.
     * @param {Number} x X-coordinate
     * @param {Number} y Y-coordinate
     * @returns An object describing the hovered area type.
     */
    getHoverTarget(x, y) {
        const grid = this.grid;
        
        const scrolledHeaderWidth = grid.headerWidth - grid.scrollX;
        const scrolledHeaderHeight = grid.headerHeight - grid.scrollY;

        const isOverColHeader = y < scrolledHeaderHeight && x > scrolledHeaderWidth;
        if (isOverColHeader) {
            return { type: 'col-header' };
        }

        const isOverRowHeader = x < scrolledHeaderWidth && y > scrolledHeaderHeight;
        if (isOverRowHeader) {
            return { type: 'row-header' };
        }

        if (x < scrolledHeaderWidth && y < scrolledHeaderHeight) {
            return { type: 'corner' };
        }

        return { type: 'cell' };
    }

    /**
     * Resizes Column and Rows on Mouse drag and controls cursor styles 
     * @param {Event} event Mouse Move event 
     */
    handleMouseMove(event) {
        if (this.isResizing) {
            if (this.resizeTarget.type === 'col') {
                this.colHandler.resize(this.resizeTarget, this.resizeStartPos, this.originalSize, event);
            } else {
                this.rowHandler.resize(this.resizeTarget, this.resizeStartPos, this.originalSize, event);
            }
        } else {
            const rect = this.canvas.getBoundingClientRect();
            const mousePos = {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };

            const colTarget = this.colHandler.getResizeTarget(mousePos);
            if (colTarget) {
                this.resizeTarget = colTarget;
                this.grid.setCursor('col-resize');
                return;
            }

            const rowTarget = this.rowHandler.getResizeTarget(mousePos);
            if (rowTarget) {
                this.resizeTarget = rowTarget;
                this.grid.setCursor('row-resize');
                return;
            }

            this.resizeTarget = null;
            
            const target = this.getHoverTarget(event.offsetX, event.offsetY);
            let cursor = 'default'; 

            switch (target.type) {
                case 'col-header':
                case 'row-header':
                    cursor = 'pointer';
                    break;
                case 'cell':
                    cursor = 'cell';
                    break;
                case 'corner':
                    cursor = 'default';
                    break;
            }
            this.grid.setCursor(cursor);
        }
    } 
    
    /**
     * Ends Resizing
     */
    handleMouseUp() {
        if (this.isResizing) {
            this.isResizing = false;
            this.removeWindowListeners();
            this.grid.updateScrollbarContentSize();
        }
    }
    
    /**
     * Sets Mouse cursor as default
     */
    handleMouseLeave() {
        if (!this.isResizing) {
            this.resizeTarget = null;
            this.grid.setCursor('default');
        }
    }
}