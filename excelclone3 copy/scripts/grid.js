import dataStorage from "./dataStorage.js";
import CellEditor from "./cellEditor.js";

export default class Grid {
    /**
     * @param {String} width Width of the grid container
     * @param {String} height Height of the grid container
     * @param {Number} rows Total rows in grid
     * @param {Number} cols Total columns in grid
     * @param {Number} defaultCellWidth Default Cell width
     * @param {Number} defaultCellHeight Default Cell height
     */
    constructor(width, height, rows, cols, defaultCellWidth, defaultCellHeight) {
        // ... (constructor is identical, no changes needed here) ...
        this.container = document.createElement("div");
        this.container.className = "grid-container";
        this.container.style.width = width;
        this.container.style.height = height;

        this.canvas = document.createElement("canvas");
        this.canvas.id = "gridCanvas";

        this.hScrollbar = document.createElement("div");
        this.hScrollbar.classList.add("scrollbar-container", "scrollbar-h");

        this.vScrollbar = document.createElement("div");
        this.vScrollbar.classList.add("scrollbar-container", "scrollbar-v");

        this.hScrollContent = document.createElement("div");
        this.hScrollContent.id = "hScrollContent";
        this.hScrollContent.className = "scrollbar-content-h";

        this.vScrollContent = document.createElement("div");
        this.vScrollContent.id = "vScrollContent";
        this.vScrollContent.className = "scrollbar-content-v";

        this.hScrollbar.appendChild(this.hScrollContent);
        this.vScrollbar.appendChild(this.vScrollContent);

        this.container.appendChild(this.canvas);
        this.container.appendChild(this.hScrollbar);
        this.container.appendChild(this.vScrollbar);

        document.body.appendChild(this.container);

        this.dataStorage = new dataStorage(this)
        this.scrollX = 0;
        this.scrollY = 0;
        this.selectedColumns = new Set();
        this.selectedRows = new Set();
        this.activeCell = null;
        this.intialCell = null;
        this.selectionArea = null;
        this.viewportStartRow = 0;
        this.viewportEndRow = 0;
        this.viewportStartCol = 0;
        this.viewportEndCol = 0;
        this.isEditing = false;

        this.needsRedraw = false;
        this.ctx = this.canvas.getContext("2d");
        this.rows = rows;
        this.cols = cols;
        this.headerWidth = defaultCellWidth;
        this.headerHeight = defaultCellHeight;
        this.colWidths = Array(cols).fill(defaultCellWidth);
        this.rowHeights = Array(rows).fill(defaultCellHeight);

        this.CellEditor = new CellEditor(this)

        this.renderLoop();
    }

    // --- Core Public API & State Methods (Unchanged) ---
    getDPR() { return window.devicePixelRatio || 1; }
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
    updateScrollbarContentSize() {
        let totalGridWidth = 0;
        for (let i = 1; i < this.cols; i++) totalGridWidth += this.colWidths[i];
        this.hScrollContent.style.width = totalGridWidth + "px";
        let totalGridHeight = 0;
        for (let i = 1; i < this.rows; i++) totalGridHeight += this.rowHeights[i];
        this.vScrollContent.style.height = totalGridHeight + "px";
    }
    renderLoop() { requestAnimationFrame(this.renderLoop.bind(this)); if (this.needsRedraw) { this.drawGrid(); this.needsRedraw = false; } }
    requestRedraw() { this.needsRedraw = true; }
    setColumnWidth(index, width) { if (index > 0 && index < this.colWidths.length) { this.colWidths[index] = width; this.updateScrollbarContentSize(); this.requestRedraw(); } }
    setRowHeight(index, height) { if (index > 0 && index < this.rowHeights.length) { this.rowHeights[index] = height; this.updateScrollbarContentSize(); this.requestRedraw(); } }
    getColWidth(index) { return this.colWidths[index]; }
    getRowHeight(index) { return this.rowHeights[index]; }
    setCursor(style) { this.canvas.style.cursor = style; }
    startEditing(clearContent = false) { if (!this.activeCell || this.CellEditor.isActive()) return; this.CellEditor.startEditing(this.activeCell); if (clearContent) { this.CellEditor.input.value = ''; } }
    
    // --- Coordinate and Utility Methods (Unchanged) ---
    calculateViewport() {
        const dpr = this.getDPR();
        const visibleH = (this.canvas.height / dpr) + this.headerHeight;
        const visibleW = (this.canvas.width / dpr) + this.headerWidth;
        let accY = 0; this.viewportStartRow = 1;
        for (let r = 1; r < this.rows; r++) { if (accY + this.rowHeights[r] >= this.scrollY) { this.viewportStartRow = r; break; } accY += this.rowHeights[r]; }
        let sumY = 0; this.viewportEndRow = this.viewportStartRow;
        for (let r = this.viewportStartRow; r < this.rows; r++) { sumY += this.rowHeights[r]; this.viewportEndRow = r; if (sumY > visibleH) break; }
        let accX = 0; this.viewportStartCol = 1;
        for (let c = 1; c < this.cols; c++) { if (accX + this.colWidths[c] >= this.scrollX) { this.viewportStartCol = c; break; } accX += this.colWidths[c]; }
        let sumX = 0; this.viewportEndCol = this.viewportStartCol;
        for (let c = this.viewportStartCol; c < this.cols; c++) { sumX += this.colWidths[c]; this.viewportEndCol = c; if (sumX > visibleW) break; }
    }
    getColX(col) { let x = this.headerWidth; for (let c = 1; c < col; c++) x += this.colWidths[c]; return x; }
    getRowY(row) { let y = this.headerHeight; for (let r = 1; r < row; r++) y += this.rowHeights[r]; return y; }
    colAtX(x) { let px = this.headerWidth; for (let c = 1; c < this.cols; c++) { if (x < px + this.colWidths[c]) return c; px += this.colWidths[c]; } return null; }
    rowAtY(y) { let py = this.headerHeight; for (let r = 1; r < this.rows; r++) { if (y < py + this.rowHeights[r]) return r; py += this.rowHeights[r]; } return null; }
    colToExcelLabel(col) { let label = ""; col++; while (col > 0) { let rem = (col - 1) % 26; label = String.fromCharCode(65 + rem) + label; col = Math.floor((col - 1) / 26); } return label; }
    getMaxScrollX() { const totalGridWidth = this.colWidths.reduce((sum, width) => sum + width, 0) - this.headerWidth; const canvasWidth = this.canvas.width / this.getDPR(); return Math.max(0, totalGridWidth - (canvasWidth - this.headerWidth)); }
    getMaxScrollY() { const totalGridHeight = this.rowHeights.reduce((sum, height) => sum + height, 0) - this.headerHeight; const canvasHeight = this.canvas.height / this.getDPR(); return Math.max(0, totalGridHeight - (canvasHeight - this.headerHeight)); }
    
    // --- Main Drawing Logic ---

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
        this._drawCellData(ctx, visibleCoords, style);
        
        this._drawHeaderBackgrounds(ctx, visibleCoords, style);
        this._drawHeaderGridlines(ctx, visibleCoords, style);
        this._drawHeaderText(ctx, visibleCoords, style, canvasWidth, canvasHeight); // Pass canvas dimensions

        this._drawHeaderMainBorder(ctx, canvasWidth, canvasHeight, style);
        this._drawSelectionBorders(ctx, style, canvasWidth, canvasHeight);
        this._drawActiveCellBorder(ctx, visibleCoords, style);
    }

    // --- Private Drawing Helper Functions ---

    _precalculateVisibleCoords() {
        const coords = { rows: {}, cols: {} };
        for (let r = this.viewportStartRow; r <= this.viewportEndRow; r++) { coords.rows[r] = { y: this.getRowY(r) - this.scrollY, height: this.rowHeights[r] }; }
        for (let c = this.viewportStartCol; c <= this.viewportEndCol; c++) { coords.cols[c] = { x: this.getColX(c) - this.scrollX, width: this.colWidths[c] }; }
        return coords;
    }

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
    
    _drawSelections(ctx, coords, style, canvasWidth, canvasHeight) {
        ctx.fillStyle = style.selectionFill;
        if (this.selectionArea && this.activeCell) {
            const { minRow, maxRow, minCol, maxCol } = this._getSelectionRange(this.selectionArea);
            const { clipX, clipY, clipW, clipH } = this._getSelectionDimensions(minRow, maxRow, minCol, maxCol);
            if (clipW > 0 && clipH > 0) ctx.fillRect(clipX, clipY, clipW, clipH);
            if (this.activeCell.row in coords.rows && this.activeCell.col in coords.cols) {
                const cell = coords.rows[this.activeCell.row];
                const col = coords.cols[this.activeCell.col];
                ctx.fillStyle = "#fff";
                ctx.fillRect(col.x, cell.y, col.width, cell.height);
            }
        } else {
            for (let c = this.viewportStartCol; c <= this.viewportEndCol; c++) if (this.selectedColumns.has(c)) ctx.fillRect(coords.cols[c].x, this.headerHeight, coords.cols[c].width, canvasHeight - this.headerHeight);
            for (let r = this.viewportStartRow; r <= this.viewportEndRow; r++) if (this.selectedRows.has(r)) ctx.fillRect(this.headerWidth, coords.rows[r].y, canvasWidth - this.headerWidth, coords.rows[r].height);
        }
    }
    
    _drawGridlines(ctx, coords, canvasWidth, canvasHeight, style) {
        ctx.beginPath();
        ctx.strokeStyle = style.gridLineColor;
        ctx.lineWidth = 1;
        for (const r in coords.rows) { const y = coords.rows[r].y + 0.5; ctx.moveTo(this.headerWidth, Math.max(this.headerHeight,y)); ctx.lineTo(canvasWidth, Math.max(this.headerHeight,y)); }
        for (const c in coords.cols) { const x = coords.cols[c].x + 0.5; ctx.moveTo(Math.max(x,this.headerWidth), this.headerHeight); ctx.lineTo(Math.max(x,this.headerWidth), canvasHeight); }
        ctx.stroke();
    }
    
    _drawCellData(ctx, coords, style) {
        ctx.font = "14px Arial";
        ctx.fillStyle = style.cellTextColor;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        for (let r = this.viewportStartRow; r <= this.viewportEndRow; r++) {
            for (let c = this.viewportStartCol; c <= this.viewportEndCol; c++) {
                if (this.isEditing && this.activeCell.row === r && this.activeCell.col === c) continue;
                const value = this.dataStorage.getCellValue(r, c);
                if (value) {
                    const row = coords.rows[r]; const col = coords.cols[c];
                    ctx.save(); ctx.beginPath(); ctx.rect(col.x, row.y, col.width - 2, row.height);
                    ctx.clip(); ctx.fillText(value, col.x + 4, row.y + row.height / 2); ctx.restore();
                }
            }
        }
    }

    _drawHeaderBackgrounds(ctx, coords, style) {
        const selectionRange = this.selectionArea ? this._getSelectionRange(this.selectionArea) : null;
        ctx.fillStyle = style.headerSelectionFill;
        if (selectionRange) {
            for (let c = selectionRange.minCol; c <= selectionRange.maxCol; c++){
                 if(c in coords.cols){
                       ctx.fillRect(Math.max(this.headerWidth,coords.cols[c].x), 0, coords.cols[c].width, this.headerHeight);
                 }
            } 
            
            for (let r = selectionRange.minRow; r <= selectionRange.maxRow; r++) 
                if(r in coords.rows) 
                    ctx.fillRect(0, Math.max(this.headerHeight,coords.rows[r].y), this.headerWidth, coords.rows[r].height);
        } else {
             if(this.selectedRows.size > 0) 
                {
                    for(const c in coords.cols) {
                        ctx.fillRect(Math.max(this.headerWidth,coords.cols[c].x), 0, coords.cols[c].width, this.headerHeight);
                    }
                }
             if(this.selectedColumns.size > 0) for(const r in coords.rows) ctx.fillRect(0, Math.max(this.headerHeight,coords.rows[r].y), this.headerWidth, coords.rows[r].height);
             
            ctx.fillStyle = style.excelGreen;
            for (const c of this.selectedColumns) if(c in coords.cols) ctx.fillRect(Math.max(this.headerWidth,coords.cols[c].x), 0, coords.cols[c].width, this.headerHeight);
            for (const r of this.selectedRows) if(r in coords.rows) ctx.fillRect(0, Math.max(this.headerHeight,coords.rows[r].y), this.headerWidth,coords.rows[r].height);
        }
    }

    _drawHeaderGridlines(ctx, coords, style) {
        ctx.beginPath();
        ctx.strokeStyle = style.headerBorderColor;
        ctx.lineWidth = 1;
        for (const c in coords.cols) { const x = coords.cols[c].x + coords.cols[c].width + 0.5; ctx.moveTo(x, 0); ctx.lineTo(x, this.headerHeight); }
        for (const r in coords.rows) { const y = coords.rows[r].y + coords.rows[r].height + 0.5; ctx.moveTo(0, y); ctx.lineTo(this.headerWidth, y); }
        ctx.stroke();
    }

    _drawHeaderText(ctx, coords, style, canvasWidth, canvasHeight) {
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // --- Draw Column Headers with Clipping ---
        ctx.save();
        ctx.beginPath();
        ctx.rect(this.headerWidth, 0, canvasWidth - this.headerWidth, this.headerHeight);
        ctx.clip();
        for (let c = this.viewportStartCol; c <= this.viewportEndCol; c++) {
            const isSelected = this.selectedColumns.has(c) && this.selectedRows.size === 0;
            ctx.fillStyle = isSelected ? "white" : style.headerTextColor;
            ctx.fillText(this.colToExcelLabel(c - 1), coords.cols[c].x + coords.cols[c].width / 2, this.headerHeight / 2);
        }
        ctx.restore(); // Remove clipping

        // --- Draw Row Headers with Clipping ---
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, this.headerHeight, this.headerWidth, canvasHeight - this.headerHeight);
        ctx.clip();
        for (let r = this.viewportStartRow; r <= this.viewportEndRow; r++) {
            const isSelected = this.selectedRows.has(r) && this.selectedColumns.size === 0;
            ctx.fillStyle = isSelected ? "white" : style.headerTextColor;
            ctx.fillText(r.toString(), this.headerWidth / 2, coords.rows[r].y + coords.rows[r].height / 2);
        }
        ctx.restore(); // Remove clipping
    }

    _drawHeaderMainBorder(ctx, canvasWidth, canvasHeight, style) {
        ctx.beginPath();
        ctx.strokeStyle = style.headerBorderColor;
        ctx.lineWidth = 1;
        ctx.moveTo(this.headerWidth + 0.5, 0); ctx.lineTo(this.headerWidth + 0.5, canvasHeight);
        ctx.moveTo(0, this.headerHeight + 0.5); ctx.lineTo(canvasWidth, this.headerHeight + 0.5);
        ctx.stroke();
    }
    
    _drawSelectionBorders(ctx, style, canvasWidth, canvasHeight) {
        ctx.strokeStyle = style.excelGreen;
        ctx.lineWidth = 2;
        if (this.selectionArea) {
            const { minRow, maxRow, minCol, maxCol } = this._getSelectionRange(this.selectionArea);
            const { clipX, clipY, clipW, clipH } = this._getSelectionDimensions(minRow, maxRow, minCol, maxCol);
            if (clipW > 0 && clipH > 0) ctx.strokeRect(clipX, clipY, clipW, clipH);
        } else if (this.selectedRows.size > 0 || this.selectedColumns.size > 0) {
            ctx.beginPath();
            if (this.selectedRows.size > 0) {
                const rows = Array.from(this.selectedRows).sort((a,b)=>a-b);
                const topY = this.getRowY(rows[0]) - this.scrollY;
                const bottomY = this.getRowY(rows[rows.length-1]) + this.rowHeights[rows[rows.length-1]] - this.scrollY;
                ctx.moveTo(this.headerWidth, Math.max(this.headerHeight, topY)); ctx.lineTo(canvasWidth, Math.max(this.headerHeight, topY));
                ctx.moveTo(this.headerWidth, Math.max(this.headerHeight, bottomY)); ctx.lineTo(canvasWidth, Math.max(this.headerHeight, bottomY));
            }
            if (this.selectedColumns.size > 0) {
                const cols = Array.from(this.selectedColumns).sort((a,b)=>a-b);
                const leftX = this.getColX(cols[0]) - this.scrollX;
                const rightX = this.getColX(cols[cols.length-1]) + this.colWidths[cols[cols.length-1]] - this.scrollX;
                ctx.moveTo(Math.max(this.headerWidth, leftX), this.headerHeight); ctx.lineTo(Math.max(this.headerWidth, leftX), canvasHeight);
                ctx.moveTo(Math.max(this.headerWidth, rightX), this.headerHeight); ctx.lineTo(Math.max(this.headerWidth, rightX), canvasHeight);
            }
            console.log("reaached")
            console.log(this.activeCell)
            ctx.stroke();
        }
    }
    
    _drawActiveCellBorder(ctx, coords, style) {
        if (this.activeCell) {
            const r = this.activeCell.row; const c = this.activeCell.col;
            if (r in coords.rows && c in coords.cols) {
                const row = coords.rows[r]; const col = coords.cols[c];
                ctx.fillStyle = "#fff"; 
                ctx.fillRect(Math.max(this.headerWidth,col.x + 1), Math.max(this.headerHeight,row.y + 1), col.width - 2 , row.height - 2 );
            }
        }
    }
    
    _getSelectionRange(area) { return { minRow: Math.min(area.start.row, area.end.row), maxRow: Math.max(area.start.row, area.end.row), minCol: Math.min(area.start.col, area.end.col), maxCol: Math.max(area.start.col, area.end.col) }; }
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
}