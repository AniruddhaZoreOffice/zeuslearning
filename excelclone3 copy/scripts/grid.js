import dataStorage from "./dataStorage.js";
import CellEditor from "./cellEditor.js";


export default class Grid {
    /**
     * Initializes the Grid component.
     * @param {string} width - The CSS width of the grid container (e.g., '800px', '100%').
     * @param {string} height - The CSS height of the grid container (e.g., '600px', '100vh').
     * @param {number} rows - The total number of rows in the grid.
     * @param {number} cols - The total number of columns in the grid.
     * @param {number} defaultCellWidth - The default width for all data cells.
     * @param {number} defaultCellHeight - The default height for all data cells.
     */

    constructor(width, height, rows, cols, defaultCellWidth, defaultCellHeight) {
        
        /**
         * The main container div for the entire grid component.
         * @type {HTMLDivElement}
         */

        this.uploadButton = document.createElement("input")
        this.uploadButton.type = "file"
        this.uploadButton.accept = ".json,application/json"; 

        this.headerDiv = document.createElement("div")
        this.headerDiv.className = "header-div"
        
        this.computations = document.createElement("div")
        this.computations.className = "computations"
        
        this.container = document.createElement("div");
        this.container.className = "grid-container";
        this.container.style.width = width;
        this.container.style.height = height;
        
        /**
         * The canvas element where the grid is rendered.
         * @type {HTMLCanvasElement}
         */
        this.canvas = document.createElement("canvas");
        this.canvas.id = "gridCanvas";

        /**
         * The container element for the horizontal scrollbar.
         * @type {HTMLDivElement}
         */
        this.hScrollbar = document.createElement("div");
        this.hScrollbar.classList.add("scrollbar-container", "scrollbar-h");

        /**
         * The container element for the vertical scrollbar.
         * @type {HTMLDivElement}
         */
        this.vScrollbar = document.createElement("div");
        this.vScrollbar.classList.add("scrollbar-container", "scrollbar-v");

        /**
         * The inner content element of the horizontal scrollbar, used to set the total scrollable width.
         * @type {HTMLDivElement}
         */
        this.hScrollContent = document.createElement("div");
        this.hScrollContent.id = "hScrollContent";
        this.hScrollContent.className = "scrollbar-content-h";

        /**
         * The inner content element of the vertical scrollbar, used to set the total scrollable height.
         * @type {HTMLDivElement}
         */
        this.vScrollContent = document.createElement("div");
        this.vScrollContent.id = "vScrollContent";
        this.vScrollContent.className = "scrollbar-content-v";

        this.hScrollbar.appendChild(this.hScrollContent);
        this.vScrollbar.appendChild(this.vScrollContent);

        this.container.appendChild(this.canvas);
        this.container.appendChild(this.hScrollbar);
        this.container.appendChild(this.vScrollbar);
        
        this.headerDiv.appendChild(this.uploadButton)
        this.headerDiv.appendChild(this.computations)

        document.body.appendChild(this.headerDiv)
        document.body.appendChild(this.container);

        /**
         * The data storage handler for the grid's cell values.
         * @type {dataStorage}
         */
        this.dataStorage = new dataStorage(this)
        
        /**
         * The current horizontal scroll position in pixels.
         * @type {number}
         */
        this.scrollX = 0;
        
        /**
         * The current vertical scroll position in pixels.
         * @type {number}
         */
        this.scrollY = 0;
        
        /**
         * A set of indices for fully selected columns.
         * @type {Set<number>}
         */
        this.selectedColumns = new Set();
        
        /**
         * A set of indices for fully selected rows.
         * @type {Set<number>}
         */
        this.selectedRows = new Set();
        
        /**
         * The currently active cell, identified by its row and column index.
         * @type {?{row: number, col: number}}
         */
        this.activeCell = null;

        /**
         * The selection area defined by a start and end cell.
         * @type {?{start: {row: number, col: number}, end: {row: number, col: number}}}
         */
        this.selectionArea = null;
        
        /**
         * The first row index currently visible in the viewport.
         * @type {number}
         */
        this.viewportStartRow = 0;
        
        /**
         * The last row index currently visible in the viewport.
         * @type {number}
         */
        this.viewportEndRow = 0;
        
        /**
         * The first column index currently visible in the viewport.
         * @type {number}
         */
        this.viewportStartCol = 0;
        
        /**
         * The last column index currently visible in the viewport.
         * @type {number}
         */
        this.viewportEndCol = 0;
        
        /**
         * A flag indicating if the cell editor is currently active.
         * @type {boolean}
         */
        this.isEditing = false;

        /**
         * A flag that signals the render loop to perform a redraw on the next frame.
         * @type {boolean}
         */
        this.needsRedraw = false;
        
        /**
         * The 2D rendering context for the canvas.
         * @type {CanvasRenderingContext2D}
         */
        this.ctx = this.canvas.getContext("2d");
        
        /**
         * The total number of rows in the grid.
         * @type {number}
         */
        this.rows = rows;
        
        /**
         * The total number of columns in the grid.
         * @type {number}
         */
        this.cols = cols;
        
        /**
         * The width of the row header area.
         * @type {number}
         */
        this.headerWidth = defaultCellWidth;
        
        /**
         * The height of the column header area.
         * @type {number}
         */
        this.headerHeight = defaultCellHeight;
        
        /**
         * An array storing the width of each column.
         * @type {Array<number>}
         */
        this.colWidths = Array(cols + 1).fill(defaultCellWidth);
        
        /**
         * An array storing the height of each row.
         * @type {Array<number>}
         */
        this.rowHeights = Array(rows + 1).fill(defaultCellHeight);

        /**
         * The cell editor instance for the grid.
         * @type {CellEditor}
         */
        this.CellEditor = new CellEditor(this)

        this.renderLoop();
    }

    /**
     * Gets the device pixel ratio to scale the canvas for high-resolution displays.
     * @returns {number} The device pixel ratio.
     */
    getDPR() { 
        return window.devicePixelRatio || 1; 
    }

    /**
     * Resizes the canvas to fit its container and adjusts for the device pixel ratio.
     * @returns {void}
     */
    resizeCanvas() {
        const dpr = this.getDPR();
        const newWidth = this.container.clientWidth - 20;
        const newHeight = this.container.clientHeight - 20;
        this.canvas.width = newWidth * dpr;
        this.canvas.height = newHeight * dpr;
        this.canvas.style.width = newWidth + "px";
        this.canvas.style.height = newHeight + "px";
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);
        this.updateScrollbarContentSize();
        this.requestRedraw();
    }

    /**
     * Updates the size of the scrollbar content divs to match the total grid dimensions.
     * @returns {void}
     */
    updateScrollbarContentSize() {
        let totalGridWidth = 0;
        for (let i = 1; i <= this.cols; i++) 
            totalGridWidth += this.colWidths[i];
        this.hScrollContent.style.width = totalGridWidth + "px";
        let totalGridHeight = 0;
        for (let i = 1; i <= this.rows; i++) totalGridHeight += this.rowHeights[i];
        this.vScrollContent.style.height = totalGridHeight + "px";
    }

    /**
     * The main render loop, which redraws the grid when `needsRedraw` is true.
     * @returns {void}
     */
    renderLoop() { 
        requestAnimationFrame(this.renderLoop.bind(this)); 
        if (this.needsRedraw) { 
            this.drawGrid(); 
            this.needsRedraw = false; 
        } 
    }
    
    /**
     * Flags the grid to be redrawn on the next animation frame.
     * @returns {void}
     */
    requestRedraw() { 
        this.needsRedraw = true; 
    }

    /**
     * Sets the width for a specific column.
     * @param {number} index - The 1-based index of the column.
     * @param {number} width - The new width in pixels.
     * @returns {void}
     */
    setColumnWidth(index, width) { 
        if (index >= 1 && index < this.colWidths.length) 
            {  
                this.colWidths[index] = width; 
                this.updateScrollbarContentSize(); 
                this.requestRedraw(); 
            }
         }

    /**
     * Sets the height for a specific row.
     * @param {number} index - The 1-based index of the row.
     * @param {number} height - The new height in pixels.
     * @returns {void}
     */
    setRowHeight(index, height) { 
        if (index >= 1 && index < this.rowHeights.length) 
            { 
                this.rowHeights[index] = height; 
                this.updateScrollbarContentSize(); 
                this.requestRedraw(); 
            } 
        }

    /**
     * Gets the width of a specific column.
     * @param {number} index - The 1-based index of the column.
     * @returns {number} The width of the column.
     */
    getColWidth(index) { 
        return this.colWidths[index]; 
    }

    /**
     * Gets the height of a specific row.
     * @param {number} index - The 1-based index of the row.
     * @returns {number} The height of the row.
     */
    getRowHeight(index) { 
        return this.rowHeights[index]; 
    }

    /**
     * Sets the CSS cursor style for the canvas element.
     * @param {string} style - The CSS cursor value (e.g., 'pointer', 'col-resize').
     * @returns {void}
     */
    setCursor(style) { 
        this.canvas.style.cursor = style; 
    }

    /**
     * Activates the cell editor on the current active cell.
     * @param {boolean} [clearContent=false] - This parameter is now implicitly handled by initialValue.
     * @param {?string} [initialValue=null] - The initial character to populate the editor with.
     * @returns {void}
     */
    startEditing(clearContent = false, initialValue = null) { 
        if (!this.activeCell || this.CellEditor.isActive()) {
            return;
        }
        this.CellEditor.startEditing(this.activeCell, initialValue); 
    }
    
    /**
     * Calculates the range of rows and columns currently visible in the viewport.
     * @returns {void}
     */
    
    calculateViewport() {
        const dpr = this.getDPR();
        const canvasH = this.canvas.height / dpr;
        const canvasW = this.canvas.width / dpr;
        const scrollbarSize = 10; 
        const visibleH = canvasH - this.headerHeight;
        const visibleW = canvasW - this.headerWidth - scrollbarSize;
    
        let y = 0;
        let startRowFound = false;
        this.viewportStartRow = this.rows + 1; 
        this.viewportEndRow = this.rows;
    
        for (let r = 1; r <= this.rows; r++) {
            const rowHeight = this.rowHeights[r];
    
            if (!startRowFound && y + rowHeight >= this.scrollY) {
                this.viewportStartRow = r;
                this.viewportEndRow = r;
                startRowFound = true;
            }
    
            if (startRowFound) {
                this.viewportEndRow = r;
                
                if (y + rowHeight - this.scrollY > visibleH) {
                    break;
                }
            }
            y += rowHeight;
        }

    let x = 0;
    let startColFound = false;
    this.viewportStartCol = this.cols + 1; 
    this.viewportEndCol = this.cols;

    for (let c = 1; c <= this.cols; c++) { 
        const colWidth = this.colWidths[c];

        if (!startColFound && x + colWidth >= this.scrollX) {
            this.viewportStartCol = c;
            this.viewportEndCol = c;
            startColFound = true;
        }

        if (startColFound) {
            this.viewportEndCol = c;
            if (x + colWidth - this.scrollX > visibleW) {
                break;
            }
        }
        x += colWidth;
    }
}
    
    /**
     * Gets the starting X-coordinate for a given column index (left edge).
     * @param {number} col - The 1-based column index.
     * @returns {number} The X-coordinate in pixels.
     */
    getColX(col) { 
        let x = this.headerWidth; 
        for (let c = 1; c < col; c++) 
            x += this.colWidths[c]; 
        return x; 
    }

    /**
     * Gets the starting Y-coordinate for a given row index (top edge).
     * @param {number} row - The 1-based row index.
     * @returns {number} The Y-coordinate in pixels.
     */
    getRowY(row) { 
        let y = this.headerHeight; 
        for (let r = 1; r < row; r++) 
            y += this.rowHeights[r]; 
        return y; 
    }

    /**
     * Determines the column index at a given X-coordinate.
     * @param {number} x - The X-coordinate in pixels, relative to the grid's total width.
     * @returns {?number} The 1-based column index, or null if not found.
     */
    colAtX(x) { 
        let px = this.headerWidth; 
        for (let c = 1; c <= this.cols; c++) 
            { 
                if (x < px + this.colWidths[c]) 
                    return c; 
                px += this.colWidths[c]; 
            } 
            return null; 
        }

    /**
     * Determines the row index at a given Y-coordinate.
     * @param {number} y - The Y-coordinate in pixels, relative to the grid's total height.
     * @returns {?number} The 1-based row index, or null if not found.
     */
    rowAtY(y) { 
        let py = this.headerHeight; 
        for (let r = 1; r <= this.rows; r++) 
            { 
                if (y < py + this.rowHeights[r]) 
                    return r; 
                py += this.rowHeights[r]; 
            } 
            return null; 
        }
    
    /**
     * Converts a 0-based column index to an Excel-style letter label (A, B, ..., Z, AA, etc.).
     * @param {number} col - The 0-based column index.
     * @returns {string} The Excel-style label.
     */
    colToExcelLabel(col) { 
        let label = ""; 
        col++; 
        while (col > 0) { 
            let rem = (col - 1) % 26; 
            label = String.fromCharCode(65 + rem) + label; 
            col = Math.floor((col - 1) / 26); 
        } 
        return label; 
    }
    
    /**
     * Calculates the maximum horizontal scroll position.
     * @returns {number} The maximum scrollX value.
     */
    getMaxScrollX() { 
        const totalGridWidth = this.colWidths.reduce((sum, width) => sum + width, 0) - this.headerWidth; 
        const canvasWidth = this.canvas.width / this.getDPR(); 
        return Math.max(0, totalGridWidth - (canvasWidth - this.headerWidth)); 
    }
    
    /**
     * Calculates the maximum vertical scroll position.
     * @returns {number} The maximum scrollY value.
     */
    getMaxScrollY() { 
        const totalGridHeight = this.rowHeights.reduce((sum, height) => sum + height, 0) - this.headerHeight; 
        const canvasHeight = this.canvas.height / this.getDPR(); 
        return Math.max(0, totalGridHeight - (canvasHeight - this.headerHeight)); 
    }
    
    /**
     * The main drawing function that orchestrates all rendering on the canvas.
     * @returns {void}
     */
    drawGrid() {
        this.calculateViewport();
        const ctx = this.ctx;
        const dpr = this.getDPR();
        const canvasWidth = this.canvas.width / dpr;
        const canvasHeight = this.canvas.height / dpr;

        const visibleCoords = this._precalculateVisibleCoords();

        const style = {
            excelGreen: '#107C41',
            selectionFill: '#E9F5EE',
            headerSelectionFill: '#CCFFCC',
            headerTextColor: '#555',
            gridLineColor: '#DCDCDC',
            headerBorderColor: '#C6C6C6',
            headerBackgroundColor: '#f5f5f5',
            cellTextColor: '#333'
        };

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this._drawBackground(ctx, canvasWidth, canvasHeight, style);
        this._drawSelections(ctx, visibleCoords, style, canvasWidth, canvasHeight);
        this._drawGridlines(ctx, visibleCoords, canvasWidth, canvasHeight, style);
        
        
        this._drawHeaderBackgrounds(ctx, visibleCoords, style,canvasWidth,canvasHeight);
        this._drawHeaderGridlines(ctx, visibleCoords, style);
        this._drawHeaderText(ctx, visibleCoords, style, canvasWidth, canvasHeight);

        this._drawHeaderMainBorder(ctx, canvasWidth, canvasHeight, style);
        this._drawSelectionBorders(ctx, style, canvasWidth, canvasHeight);
        this._drawActiveCellBorder(ctx, visibleCoords, style);
        this._drawCellData(ctx, visibleCoords, style,canvasWidth,canvasHeight);
    }
    
    /**
     * @private
     * Pre-calculates the screen coordinates (x, y, width, height) for all visible rows and columns.
     * @returns {{rows: object, cols: object}} An object containing coordinate data for visible rows and columns.
     */
    _precalculateVisibleCoords() {
        const coords = { rows: {}, cols: {} };
        for (let r = this.viewportStartRow; r <= this.viewportEndRow; r++)
             { 
                coords.rows[r] = { 
                    y: this.getRowY(r) - this.scrollY, 
                    height: this.rowHeights[r] 
                }; 
            }

        for (let c = this.viewportStartCol; c <= this.viewportEndCol; c++) 
            { 
                coords.cols[c] = { 
                    x: this.getColX(c) - this.scrollX, 
                    width: this.colWidths[c] 
                }; 
            }

        return coords;
    }

    /**
     * @private
     * Draws the main background colors for the canvas and headers.
     * @param {CanvasRenderingContext2D} ctx - The rendering context.
     * @param {number} canvasWidth - The logical width of the canvas.
     * @param {number} canvasHeight - The logical height of the canvas.
     * @param {object} style - The style object containing colors.
     * @returns {void}
     */
    _drawBackground(ctx, canvasWidth, canvasHeight, style) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = style.headerBackgroundColor;
        ctx.fillRect(0, 0, canvasWidth, this.headerHeight);
        ctx.fillRect(0, 0, this.headerWidth, canvasHeight);
        if (this.selectedRows.size > 0 && this.selectedColumns.size > 0) {
            ctx.fillStyle = style.headerBackgroundColor;
            ctx.fillRect(0, 0, this.headerWidth, this.headerHeight);
        }
    }
    
    /**
     * @private
     * Draws the fill color for selected cell ranges, rows, or columns.
     * @param {CanvasRenderingContext2D} ctx - The rendering context.
     * @param {object} coords - Pre-calculated coordinates of visible cells.
     * @param {object} style - The style object containing colors.
     * @param {number} canvasWidth - The logical width of the canvas.
     * @param {number} canvasHeight - The logical height of the canvas.
     * @returns {void}
     */
    _drawSelections(ctx, coords, style, canvasWidth, canvasHeight) {
        ctx.fillStyle = style.selectionFill;
        if (this.selectionArea && this.activeCell) {
            const { minRow, maxRow, minCol, maxCol } = this._getSelectionRange(this.selectionArea);
            const { clipX, clipY, clipW, clipH } = this._getSelectionDimensions(minRow, maxRow, minCol, maxCol);
            if (clipW > 0 && clipH > 0){ 
                ctx.fillRect(clipX, clipY, clipW, clipH);
            }
            
        } else {
            for (let c = this.viewportStartCol; c <= this.viewportEndCol; c++) 
                if (this.selectedColumns.has(c)) 
                    ctx.fillRect(coords.cols[c].x, 
                this.headerHeight, 
                coords.cols[c].width, 
                canvasHeight - this.headerHeight
            );
            for (let r = this.viewportStartRow; r <= this.viewportEndRow; r++) 
                if (this.selectedRows.has(r)) 
                    ctx.fillRect(this.headerWidth, coords.rows[r].y, canvasWidth - this.headerWidth, coords.rows[r].height);
        }
    }
    
     /**
     * @private
     * Renders the text content of the visible cells, clipping text that overflows the cell's boundaries.
     * @param {CanvasRenderingContext2D} ctx - The rendering context.
     * @param {object} coords - Pre-calculated coordinates of visible cells.
     * @param {object} style - The style object containing colors.
     * @returns {void}
     */
    _drawCellData(ctx, coords, style,canvasWidth,canvasHeight) {
        ctx.save(); 
        ctx.beginPath();
        ctx.rect(
            this.headerWidth,
            this.headerHeight,
            canvasWidth - this.headerWidth,
            canvasHeight - this.headerHeight
        );
        ctx.clip();
        ctx.font = "14px Arial";
        ctx.fillStyle = style.cellTextColor;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";

        const PADDING = 4; 

        for (let r = this.viewportStartRow; r <= this.viewportEndRow; r++) {
            for (let c = this.viewportStartCol; c <= this.viewportEndCol; c++) {
                if (this.isEditing && this.activeCell.row === r && this.activeCell.col === c) {
                    continue;
                }
                const value = this.dataStorage.getCellValue(r, c);
                if (value) {
                    const row = coords.rows[r];
                    const col = coords.cols[c];
                    
                    ctx.save();
                    
                    ctx.beginPath();
                    ctx.rect(col.x, row.y, col.width, row.height);
                    ctx.clip();
                    ctx.fillText(value, col.x + PADDING, row.y + row.height / 2);
                    ctx.restore();

                }
            }
        }
        ctx.restore()
    }

    /**
     * @private
     * Draws the background color for selected headers, with proper clipping and correct logic.
     * @param {CanvasRenderingContext2D} ctx - The rendering context.
     * @param {object} coords - Pre-calculated coordinates of visible cells.
     * @param {object} style - The style object containing colors.
     * @param {number} canvasWidth - The logical width of the canvas.
     * @param {number} canvasHeight - The logical height of the canvas.
     * @returns {void}
     */
    _drawHeaderBackgrounds(ctx, coords, style, canvasWidth, canvasHeight) {
        const selectionRange = this.selectionArea ? this._getSelectionRange(this.selectionArea) : null;
       
        if (selectionRange) {
          
            ctx.fillStyle = style.headerSelectionFill;

            for (const cStr in coords.cols) {
                const c = parseInt(cStr, 10);
               
                if (c >= selectionRange.minCol && c <= selectionRange.maxCol) {
                    const startX = Math.max(this.headerWidth, coords.cols[c].x);
                    const endX = Math.min(canvasWidth, coords.cols[c].x + coords.cols[c].width);
                    const clippedWidth = endX - startX;
                    
                    if (clippedWidth > 0) {
                        ctx.fillRect(startX, 0, clippedWidth, this.headerHeight);
                        
                    }
                }
            }
            
            for (const rStr in coords.rows) {
                const r = parseInt(rStr, 10);
                
                if (r >= selectionRange.minRow && r <= selectionRange.maxRow) {
                    const startY = Math.max(this.headerHeight, coords.rows[r].y);
                    const endY = Math.min(canvasHeight, coords.rows[r].y + coords.rows[r].height);
                    const clippedHeight = endY - startY;
                    if (clippedHeight > 0) {
                        ctx.fillRect(0, startY, this.headerWidth, clippedHeight);
                       
                    }
                }
            }
        } else {
          
            ctx.fillStyle = style.headerSelectionFill;
            if (this.selectedRows.size > 0) {
                ctx.fillRect(this.headerWidth, 0, canvasWidth - this.headerWidth, this.headerHeight);
            }
            if (this.selectedColumns.size > 0) {
                ctx.fillRect(0, this.headerHeight, this.headerWidth, canvasHeight - this.headerHeight);
            }
            
            ctx.fillStyle = style.excelGreen;

            for (const cStr in coords.cols) {
                
                if (this.selectedColumns.has(parseInt(cStr, 10))) {
                    const c = parseInt(cStr, 10);
                    const startX = Math.max(this.headerWidth, coords.cols[c].x);
                    const endX = Math.min(canvasWidth, coords.cols[c].x + coords.cols[c].width);
                    const clippedWidth = endX - startX;
                    if (clippedWidth > 0) {
                        ctx.fillRect(startX, 0, clippedWidth, this.headerHeight);
                       
                    }
                }
            }

            for (const rStr in coords.rows) {
               
                if (this.selectedRows.has(parseInt(rStr, 10))) {
                    const r = parseInt(rStr, 10);
                    const startY = Math.max(this.headerHeight, coords.rows[r].y);
                    const endY = Math.min(canvasHeight, coords.rows[r].y + coords.rows[r].height);
                    const clippedHeight = endY - startY;
                    if (clippedHeight > 0) {
                        ctx.fillRect(0, startY, this.headerWidth, clippedHeight);
                    }
                }
            }
        }
    }

    /**
     * @private
     * Draws the horizontal and vertical gridlines for the data cells.
     * @param {CanvasRenderingContext2D} ctx - The rendering context.
     * @param {object} coords - Pre-calculated coordinates of visible cells.
     * @param {number} canvasWidth - The logical width of the canvas.
     * @param {number} canvasHeight - The logical height of the canvas.
     * @param {object} style - The style object containing colors.
     * @returns {void}
     */
    _drawGridlines(ctx, coords, canvasWidth, canvasHeight, style) {
        ctx.beginPath();
        ctx.strokeStyle = style.gridLineColor;
        ctx.lineWidth = 1;
        for (const r in coords.rows) 
            { const y = coords.rows[r].y + 0.5; 
                ctx.moveTo(this.headerWidth, 
                    Math.max(this.headerHeight,y)); 
                ctx.lineTo(canvasWidth, Math.max(this.headerHeight,y)); 
            }

        for (const c in coords.cols) 
            { const x = coords.cols[c].x + 0.5; 
                ctx.moveTo(Math.max(x,this.headerWidth), this.headerHeight); 
                ctx.lineTo(Math.max(x,this.headerWidth), canvasHeight); 
            }
        
        const lastRowCoords = coords.rows[this.viewportEndRow];
        if (lastRowCoords) {
            const bottomY = lastRowCoords.y + lastRowCoords.height + 0.5;
            ctx.moveTo(this.headerWidth, bottomY);
            ctx.lineTo(canvasWidth, bottomY);
        }

        const lastColCoords = coords.cols[this.viewportEndCol];
        if (lastColCoords) {
            const rightX = lastColCoords.x + lastColCoords.width + 0.5;
            ctx.moveTo(rightX, this.headerHeight);
            ctx.lineTo(rightX, canvasHeight);
        }    

        ctx.stroke();
    }
    

    /**
     * @private
     * Draws the gridlines within the header areas.
     * @param {CanvasRenderingContext2D} ctx - The rendering context.
     * @param {object} coords - Pre-calculated coordinates of visible cells.
     * @param {object} style - The style object containing colors.
     * @returns {void}
     */
    _drawHeaderGridlines(ctx, coords, style) {
        ctx.beginPath();
        ctx.strokeStyle = style.headerBorderColor;
        ctx.lineWidth = 1;
        for (const c in coords.cols) { const x = coords.cols[c].x + coords.cols[c].width + 0.5; ctx.moveTo(x, 0); ctx.lineTo(x, this.headerHeight); }
        for (const r in coords.rows) { const y = coords.rows[r].y + coords.rows[r].height + 0.5; ctx.moveTo(0, y); ctx.lineTo(this.headerWidth, y); }
        ctx.stroke();
    }

    /**
     * @private
     * Renders the text labels for the row and column headers.
     * @param {CanvasRenderingContext2D} ctx - The rendering context.
     * @param {object} coords - Pre-calculated coordinates of visible cells.
     * @param {object} style - The style object containing colors.
     * @param {number} canvasWidth - The logical width of the canvas.
     * @param {number} canvasHeight - The logical height of the canvas.
     * @returns {void}
     */
    _drawHeaderText(ctx, coords, style, canvasWidth, canvasHeight) {
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.save();
        ctx.beginPath();
        ctx.rect(this.headerWidth, 0, canvasWidth - this.headerWidth, this.headerHeight);
        ctx.clip();
        for (let c = this.viewportStartCol; c <= this.viewportEndCol; c++) {
            const isSelected = this.selectedColumns.has(c) && this.selectedRows.size === 0;
            ctx.fillStyle = isSelected ? "white" : style.headerTextColor;
            ctx.fillText(this.colToExcelLabel(c - 1), coords.cols[c].x + coords.cols[c].width / 2, this.headerHeight / 2);
        }
        ctx.restore(); 
       
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, this.headerHeight, this.headerWidth, canvasHeight - this.headerHeight);
        ctx.clip();
        for (let r = this.viewportStartRow; r <= this.viewportEndRow; r++) {
            const isSelected = this.selectedRows.has(r) && this.selectedColumns.size === 0;
            ctx.fillStyle = isSelected ? "white" : style.headerTextColor;
            ctx.fillText(r.toString(), this.headerWidth / 2, coords.rows[r].y + coords.rows[r].height / 2);
        }
        ctx.restore(); 
    }

    /**
     * @private
     * Draws the main border separating the headers from the data cells.
     * @param {CanvasRenderingContext2D} ctx - The rendering context.
     * @param {number} canvasWidth - The logical width of the canvas.
     * @param {number} canvasHeight - The logical height of the canvas.
     * @param {object} style - The style object containing colors.
     * @returns {void}
     */
    _drawHeaderMainBorder(ctx, canvasWidth, canvasHeight, style) {
        ctx.beginPath();
        ctx.strokeStyle = style.headerBorderColor;
        ctx.lineWidth = 1;
        ctx.moveTo(this.headerWidth + 0.5, 0); ctx.lineTo(this.headerWidth + 0.5, canvasHeight);
        ctx.moveTo(0, this.headerHeight + 0.5); ctx.lineTo(canvasWidth, this.headerHeight + 0.5);
        ctx.stroke();
    }
    
    /**
     * @private
     * Draws the thick outer border around the current selection area or selected rows/columns.
     * @param {CanvasRenderingContext2D} ctx - The rendering context.
     * @param {object} style - The style object containing colors.
     * @param {number} canvasWidth - The logical width of the canvas.
     * @param {number} canvasHeight - The logical height of the canvas.
     * @returns {void}
     */
    _drawSelectionBorders(ctx, style, canvasWidth, canvasHeight) {
        ctx.strokeStyle = style.excelGreen;
        ctx.lineWidth = 2;
        if (this.selectionArea) {
            const { minRow, maxRow, minCol, maxCol } = this._getSelectionRange(this.selectionArea);
            const { clipX, clipY, clipW, clipH } = this._getSelectionDimensions(minRow, maxRow, minCol, maxCol);
            if (clipW > 0 && clipH > 0) 
                ctx.strokeRect(clipX, clipY, clipW, clipH);
            ctx.beginPath();

            
            const startX = this.getColX(minCol) - this.scrollX;
            const endX = this.getColX(maxCol + 1) - this.scrollX;
            const finalStartX = Math.max(this.headerWidth, startX);
            const finalEndX = Math.max(this.headerWidth, endX);

            ctx.moveTo(finalStartX, this.headerHeight - 0.5);
            ctx.lineTo(finalEndX, this.headerHeight - 0.5);

            
            const startY = this.getRowY(minRow) - this.scrollY;
            const endY = this.getRowY(maxRow + 1) - this.scrollY;
            const finalStartY = Math.max(this.headerHeight, startY);
            const finalEndY = Math.max(this.headerHeight, endY);
            
            ctx.moveTo(this.headerWidth - 0.5, finalStartY);
            ctx.lineTo(this.headerWidth - 0.5, finalEndY);
            
            ctx.stroke();
        } else 
            if (this.selectedRows.size > 0 || this.selectedColumns.size > 0) {
            ctx.beginPath();
            if (this.selectedRows.size > 0) {
                
                const rows = Array.from(this.selectedRows).sort((a,b)=>a-b);
                const topY = this.getRowY(rows[0]) - this.scrollY;
                const bottomY = this.getRowY(rows[rows.length-1]) + this.rowHeights[rows[rows.length-1]] - this.scrollY;
                
                ctx.moveTo(0, Math.max(this.headerHeight, topY)); 
                ctx.lineTo(canvasWidth, Math.max(this.headerHeight, topY));
                
                ctx.moveTo(0, Math.max(this.headerHeight, bottomY)); 
                ctx.lineTo(canvasWidth, Math.max(this.headerHeight, bottomY));
                
                ctx.moveTo(this.headerWidth,this.headerHeight)
                ctx.lineTo(this.canvas.width,this.headerHeight)
            }
            if (this.selectedColumns.size > 0) {
                
                const cols = Array.from(this.selectedColumns).sort((a,b)=>a-b);
                const leftX = this.getColX(cols[0]) - this.scrollX;
                const rightX = this.getColX(cols[cols.length-1]) + this.colWidths[cols[cols.length-1]] - this.scrollX;
                
                ctx.moveTo(Math.max(this.headerWidth, leftX), 0); 
                ctx.lineTo(Math.max(this.headerWidth, leftX), canvasHeight);
                
                ctx.moveTo(Math.max(this.headerWidth, rightX), 0); 
                ctx.lineTo(Math.max(this.headerWidth, rightX), canvasHeight);

                ctx.moveTo(this.headerWidth,this.headerHeight)
                ctx.lineTo(this.headerWidth,this.canvas.height)
            }
            ctx.stroke();

        }
    }
    
    /**
     * @private
     * Draws the border for the active cell, ensuring it's visually distinct.
     * @param {CanvasRenderingContext2D} ctx - The rendering context.
     * @param {object} coords - Pre-calculated coordinates of visible cells.
     * @param {object} style - The style object containing colors.
     * @returns {void}
     */
    _drawActiveCellBorder(ctx, coords, style) {
        let cellToDraw = this.activeCell;
        if (!cellToDraw && (this.selectedRows.size > 0 || this.selectedColumns.size > 0)) {
            let activeRow, activeCol;
            if (this.selectedRows.size > 0) {
                activeRow = Math.min(...this.selectedRows);
                activeCol = 1;
            } else { 
                activeRow = 1;
                activeCol = Math.min(...this.selectedColumns);
            }
            cellToDraw = { row: activeRow, col: activeCol };
        }
    
        if (cellToDraw) {
            const r = cellToDraw.row;
            const c = cellToDraw.col;
            if (r in coords.rows && c in coords.cols) {
                const row = coords.rows[r];
                const col = coords.cols[c];
                const dpr = this.getDPR();
                const canvasWidth = this.canvas.width / dpr;
                const canvasHeight = this.canvas.height / dpr;
                ctx.save();
                ctx.beginPath();
                ctx.rect(this.headerWidth, this.headerHeight, canvasWidth - this.headerWidth, canvasHeight - this.headerHeight);
                ctx.clip();
                ctx.fillStyle = "#fff";
                ctx.fillRect(col.x + 1, row.y + 1, col.width - 2, row.height - 2);
                ctx.restore();
                
                


            }
        }
    }
    
    /**
     * @private
     * Normalizes a selection area to get the top-left and bottom-right corners.
     * @param {{start: {row: number, col: number}, end: {row: number, col: number}}} area - The selection area.
     * @returns {{minRow: number, maxRow: number, minCol: number, maxCol: number}} The normalized range.
     */
    _getSelectionRange(area) { 
        return { 
            minRow: Math.min(area.start.row, area.end.row), 
            maxRow: Math.max(area.start.row, area.end.row), 
            minCol: Math.min(area.start.col, area.end.col), 
            maxCol: Math.max(area.start.col, area.end.col) 
        }; 
    }

    /**
     * @private
     * Calculates the clipped screen dimensions for a selection range.
     * @param {number} minRow - The starting row of the selection.
     * @param {number} maxRow - The ending row of the selection.
     * @param {number} minCol - The starting column of the selection.
     * @param {number} maxCol - The ending column of the selection.
     * @returns {{clipX: number, clipY: number, clipW: number, clipH: number}} The clipped dimensions.
     */
    _getSelectionDimensions(minRow, maxRow, minCol, maxCol) {
        const idealX = this.getColX(minCol) - this.scrollX;
        const idealY = this.getRowY(minRow) - this.scrollY;
        let idealW = 0; for (let i = minCol; i <= maxCol; i++) idealW += this.colWidths[i];
        let idealH = 0; for (let i = minRow; i <= maxRow; i++) idealH += this.rowHeights[i];
        const clipX = Math.max(this.headerWidth, idealX);
        const clipY = Math.max(this.headerHeight, idealY);
        const clipW = idealW - (clipX - idealX);
        const clipH = idealH - (clipY - idealY);
        return { clipX, clipY, clipW, clipH };
    }

    /**
     * Moves the active cell and resets the selection to that single cell.
     * @param {number} dx - The change in columns (-1 for left, 1 for right).
     * @param {number} dy - The change in rows (-1 for up, 1 for down).
     */
    moveActiveCell(dx, dy) {
        let { row, col } = this.activeCell || { row: 1, col: 1 };

        const newRow = Math.max(1, Math.min(this.rows, row + dy));
        const newCol = Math.max(1, Math.min(this.cols, col + dx));

        this.clearSelections(false); // Clear old selections but don't redraw yet

        this.activeCell = { row: newRow, col: newCol };
        this.selectionArea = { start: this.activeCell, end: this.activeCell };
        
        this.ensureCellIsVisible(newRow, newCol);
        this.requestRedraw();
    }

    /**
     * Extends the current selection area from the active cell.
     * @param {number} dx - The change in columns.
     * @param {number} dy - The change in rows.
     */
    extendSelection(dx, dy) {
        if (!this.selectionArea) {
            this.moveActiveCell(dx, dy);
            return;
        }

        let { row, col } = this.selectionArea.end;

        const newRow = Math.max(1, Math.min(this.rows, row + dy));
        const newCol = Math.max(1, Math.min(this.cols, col + dx));
        
        this.selectionArea.end = { row: newRow, col: newCol };
        
        this.ensureCellIsVisible(newRow, newCol);
        this.requestRedraw();
    }

    /**
     * Clears all selections (cell range, full rows, full columns).
     * @param {boolean} [redraw=true] - Whether to request a redraw after clearing.
     */
    clearSelections(redraw = true) {
        this.selectionArea = null;
        this.selectedRows.clear();
        this.selectedColumns.clear();
        if (redraw) {
            this.requestRedraw();
        }
    }

    /**
     * Clears the data content of all cells within the current selection.
     */
    clearSelectionContents() {
        if (this.selectionArea) {
            const { minRow, maxRow, minCol, maxCol } = this._getSelectionRange(this.selectionArea);
            for (let r = minRow; r <= maxRow; r++) {
                for (let c = minCol; c <= maxCol; c++) {
                    this.dataStorage.setCellValue(r, c, '');
                }
            }
        }
       
        
        this.requestRedraw();
    }

    /**
     * Ensures the specified cell is visible in the viewport, scrolling if necessary.
     * @param {number} row - The row index of the cell.
     * @param {number} col - The column index of the cell.
     */
    ensureCellIsVisible(row, col) {
        const dpr = this.getDPR();
        const canvasWidth = this.canvas.width / dpr;
        const canvasHeight = this.canvas.height / dpr;

        
        const cellTopY = this.getRowY(row);
        const cellBottomY = cellTopY + this.getRowHeight(row);
        const visibleTopY = this.scrollY + this.headerHeight;
        const visibleBottomY = this.scrollY + canvasHeight;

        if (cellTopY < visibleTopY) {
            this.vScrollbar.scrollTop = cellTopY - this.headerHeight;
        } else if (cellBottomY > visibleBottomY) {
            this.vScrollbar.scrollTop = cellBottomY - canvasHeight;
        }

        
        const cellLeftX = this.getColX(col);
        const cellRightX = cellLeftX + this.getColWidth(col);
        const visibleLeftX = this.scrollX + this.headerWidth;
        const visibleRightX = this.scrollX + canvasWidth;

        if (cellLeftX < visibleLeftX) {
            this.hScrollbar.scrollLeft = cellLeftX - this.headerWidth;
        } else if (cellRightX > visibleRightX) {
            this.hScrollbar.scrollLeft = cellRightX - canvasWidth;
        }
    }

     /**
     * Commits the current edit, stops the editing mode, and then moves the active cell.
     * @param {number} dx - The change in columns (-1 for left, 1 for right).
     * @param {number} dy - The change in rows (-1 for up, 1 for down).
     */
    stopEditingAndMove(dx, dy) {
        if (!this.isEditing) {
            return;
        }

        this.CellEditor.stopEditing(true); 

        this.moveActiveCell(dx, dy);
    }

    /**
     * Loads a new dataset from a JSON array, updates grid dimensions, and redraws.
     * @param {Array<object>} jsonData - An array of objects representing the data.
     */
    loadData(jsonData) {
        if (!Array.isArray(jsonData) || jsonData.length === 0) {
            alert("Invalid or empty data provided.");
            return;
        }
    
        const headers = Object.keys(jsonData[0]);
        const newDataRows = jsonData.length;
        const newDataCols = headers.length;
        const requiredRows = newDataRows + 1;
        const requiredCols = newDataCols;
        if (requiredRows > this.rows) {
            this.rows = requiredRows;
            
            const defaultCellHeight = this.rowHeights[1] || 24;
            while (this.rowHeights.length <= this.rows) {
                this.rowHeights.push(defaultCellHeight);
            }
        }
        
        if (requiredCols > this.cols) {
            this.cols = requiredCols;
           
            const defaultCellWidth = this.colWidths[1] || 100;
            while (this.colWidths.length <= this.cols) {
                this.colWidths.push(defaultCellWidth);
            }
        }

        
        this.dataStorage.clear();
        this.clearSelections(false); 
        this.activeCell = null;
        this.scrollX = 0; 
        this.scrollY = 0;
        this.hScrollbar.scrollLeft = 0;
        this.vScrollbar.scrollTop = 0;
    
        headers.forEach((header, colIndex) => {
            
            this.dataStorage.setCellValue(1, colIndex + 1, header);

        });
    
        jsonData.forEach((dataRow, rowIndex) => {
            headers.forEach((header, colIndex) => {
               
                this.dataStorage.setCellValue(rowIndex + 2, colIndex + 1, dataRow[header]);
            });
        });
    
        this.updateScrollbarContentSize();
        this.clearSelections();
        this.activeCell = null;
        this.requestRedraw();
        
        
    }
    }