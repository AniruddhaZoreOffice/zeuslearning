import ResizeHandler from "./resizeHandler.js";
import SelectionHandler from "./SelectionHandler.js";

export default class Grid {
    constructor(width, height, rows, cols, defaultCellWidth, defaultCellHeight) {
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

        this.cellData = new Map();
        this.scrollX = 0;
        this.scrollY = 0;
        this.selectedColumns = new Set();
        this.selectedRows = new Set();
        this.activeCell = null;
        this.selectionArea = null;
        this.viewportStartRow = 0;
        this.viewportEndRow = 0;
        this.viewportStartCol = 0;
        this.viewportEndCol = 0;

        this.needsRedraw = false;
        this.ctx = this.canvas.getContext("2d");
        this.rows = rows;
        this.cols = cols;
        this.headerWidth = defaultCellWidth;
        this.headerHeight = defaultCellHeight;
        this.colWidths = Array(cols).fill(defaultCellWidth);
        this.rowHeights = Array(rows).fill(defaultCellHeight);

        this.resizeHandler = new ResizeHandler(this);
        this.selectionHandler = new SelectionHandler(this);

        this.boundSelectionMouseMove = this.selectionHandler.handleMouseMove.bind(this.selectionHandler);
        this.boundSelectionMouseUp = this.selectionHandler.handleMouseUp.bind(this.selectionHandler);

        this.canvas.addEventListener('mousedown', (event) => {
            this.resizeHandler.handleMouseDown(event);
            this.selectionHandler.handleMouseDown(event);
        });

        this.canvas.addEventListener('mousemove', (event) => {
            this.resizeHandler.handleMouseMove(event);
        });

        this.canvas.addEventListener('mouseleave', () => {
            if (!this.resizeHandler.isResizing) {
                this.setCursor('default');
            }
        });

        this.renderLoop();
    }

    getDPR() {
        return window.devicePixelRatio || 1;
    }

    updateScrollbarContentSize() {
        let totalGridWidth = 0;
        for (let i = 1; i < this.cols; i++) {
            totalGridWidth += this.colWidths[i];
        }
        this.hScrollContent.style.width = totalGridWidth + "px";
        let totalGridHeight = 0;
        for (let i = 1; i < this.rows; i++) {
            totalGridHeight += this.rowHeights[i];
        }
        this.vScrollContent.style.height = totalGridHeight + "px";
    }

    resizeCanvas() {
        const dpr = this.getDPR();
        this.canvas.width = (this.container.clientWidth - 20) * dpr;
        this.canvas.height = (this.container.clientHeight - 20) * dpr;
        this.canvas.style.width = this.container.clientWidth - 20 + "px";
        this.canvas.style.height = this.container.clientHeight - 20 + "px";
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);
        this.updateScrollbarContentSize();
        this.requestRedraw();
    }

    setCellValue(row, col, value) {
        const key = `${row},${col}`;
        if (value === "" || value === null || value === undefined) {
            this.cellData.delete(key);
        } else {
            this.cellData.set(key, value);
        }
    }

    getCellValue(row, col) {
        return this.cellData.get(`${row},${col}`) || "";
    }

    clearAllCells() {
        this.cellData.clear();
    }

    calculateViewport() {
        let accY = 0;
        this.viewportStartRow = 1;
        for (let r = 1; r < this.rows; r++) {
            if (accY >= this.scrollY) {
                this.viewportStartRow = r;
                break;
            }
            accY += this.rowHeights[r];
        }
        const visibleH = this.canvas.height / this.getDPR();
        let sumY = 0;
        this.viewportEndRow = this.viewportStartRow;
        for (let r = this.viewportStartRow; r < this.rows; r++) {
            if (r >= this.rowHeights.length) break;
            sumY += this.rowHeights[r];
            if (sumY > visibleH) break;
            this.viewportEndRow = r;
        }

        let accX = 0;
        this.viewportStartCol = 1;
        for (let c = 1; c < this.cols; c++) {
            if (accX >= this.scrollX) {
                this.viewportStartCol = c;
                break;
            }
            accX += this.colWidths[c];
        }
        const visibleW = this.canvas.width / this.getDPR();
        let sumX = 0;
        this.viewportEndCol = this.viewportStartCol;
        for (let c = this.viewportStartCol; c < this.cols; c++) {
            if (c >= this.colWidths.length) break;
            sumX += this.colWidths[c];
            if (sumX > visibleW) break;
            this.viewportEndCol = c;
        }
    }

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

    getColX(col) {
        let x = this.headerWidth;
        for (let c = 1; c < col; c++) x += this.colWidths[c];
        return x;
    }

    getRowY(row) {
        let y = this.headerHeight;
        for (let r = 1; r < row; r++) y += this.rowHeights[r];
        return y;
    }

    colAtX(x) {
        let px = this.headerWidth;
        for (let c = 1; c < this.cols; c++) {
            if (x < px + this.colWidths[c]) return c;
            px += this.colWidths[c];
        }
        return null;
    }

    rowAtY(y) {
        let py = this.headerHeight;
        for (let r = 1; r < this.rows; r++) {
            if (y < py + this.rowHeights[r]) return r;
            py += this.rowHeights[r];
        }
        return null;
    }

    renderLoop() {
        requestAnimationFrame(this.renderLoop.bind(this));
        if (this.needsRedraw) {
            this.drawGrid();
            this.needsRedraw = false;
        }
    }

    requestRedraw() {
        this.needsRedraw = true;
    }

    getColWidth(index) {
        return this.colWidths[index];
    }

    setColumnWidth(index, width) {
        this.colWidths[index] = width;
        this.requestRedraw();
    }

    getRowHeight(index) {
        return this.rowHeights[index];
    }

    setRowHeight(index, height) {
        this.rowHeights[index] = height;
        this.requestRedraw();
    }

    setCursor(style) {
        this.canvas.style.cursor = style;
    }

    addSelectionWindowListeners() {
        window.addEventListener('mousemove', this.boundSelectionMouseMove);
        window.addEventListener('mouseup', this.boundSelectionMouseUp);
    }

    removeSelectionWindowListeners() {
        window.removeEventListener('mousemove', this.boundSelectionMouseMove);
        window.removeEventListener('mouseup', this.boundSelectionMouseUp);
    }

    // In Grid.js

    drawGrid() {
        this.calculateViewport();
        const ctx = this.ctx;
    
        // --- Excel Color Theme ---
        const excelGreen = '#107C41';
        const selectionFill = '#E9F5EE';
        const headerSelectionFill = '#CCFFCC';
        const defaultHeaderTextColor = '#555';
        const defaultGridLineColor = '#DCDCDC';
    
        // --- 1. CLEAR & DRAW BASE BACKGROUNDS ---
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = "#f5f5f5";
        ctx.fillRect(0, 0, this.canvas.width, this.headerHeight);
        ctx.fillRect(0, 0, this.headerWidth, this.canvas.height);
    
        // --- 2. DRAW SELECTION HIGHLIGHTS (FILLS) ---
        if (this.selectionArea && this.activeCell) {
            const minRow = Math.min(this.selectionArea.start.row, this.selectionArea.end.row);
            const maxRow = Math.max(this.selectionArea.start.row, this.selectionArea.end.row);
            const minCol = Math.min(this.selectionArea.start.col, this.selectionArea.end.col);
            const maxCol = Math.max(this.selectionArea.start.col, this.selectionArea.end.col);
    
            ctx.fillStyle = selectionFill;
            for (let r = minRow; r <= maxRow; r++) {
                for (let c = minCol; c <= maxCol; c++) {
                    if (r >= this.viewportStartRow && r <= this.viewportEndRow && c >= this.viewportStartCol && c <= this.viewportEndCol) {
                        if (r === this.activeCell.row && c === this.activeCell.col) continue;
                        
                        const x = this.getColX(c) - this.scrollX;
                        const y = this.getRowY(r) - this.scrollY;
                        ctx.fillRect(x, y, this.colWidths[c], this.rowHeights[r]);
                    }
                }
            }
        } else {
            ctx.fillStyle = selectionFill;
            for (const c of this.selectedColumns) {
                if (c >= this.viewportStartCol && c <= this.viewportEndCol) {
                    const x = this.getColX(c) - this.scrollX;
                    ctx.fillRect(x, this.headerHeight, this.colWidths[c], this.canvas.height);
                }
            }
            for (const r of this.selectedRows) {
                if (r >= this.viewportStartRow && r <= this.viewportEndRow) {
                    const y = this.getRowY(r) - this.scrollY;
                    ctx.fillRect(this.headerWidth, y, this.canvas.width, this.rowHeights[r]);
                }
            }
        }

    // --- 3. DRAW GRID LINES ---
    ctx.beginPath();
    ctx.strokeStyle = defaultGridLineColor;
    for (let c = this.viewportStartCol; c <= this.viewportEndCol + 1; c++) {
        const x = this.getColX(c) - this.scrollX;
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, this.canvas.height);
    }
    for (let r = this.viewportStartRow; r <= this.viewportEndRow + 1; r++) {
        const y = this.getRowY(r) - this.scrollY;
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(this.canvas.width, y + 0.5);
    }
    ctx.stroke();

    // --- 4. DRAW CELL DATA TEXT ---
    ctx.font = "14px Arial";
    ctx.fillStyle = "#333";
    ctx.textBaseline = "middle";
    for (let r = this.viewportStartRow; r <= this.viewportEndRow; r++) {
        for (let c = this.viewportStartCol; c <= this.viewportEndCol; c++) {
            const value = this.getCellValue(r, c);
            if (value) {
                const screenX = this.getColX(c) - this.scrollX;
                const screenY = this.getRowY(r) - this.scrollY;
                ctx.save();
                ctx.beginPath();
                ctx.rect(screenX + 4, screenY, this.colWidths[c] - 6, this.rowHeights[r]);
                ctx.clip();
                ctx.textAlign = "left";
                ctx.fillText(value, screenX + 4, screenY + this.rowHeights[r] / 2);
                ctx.restore();
            }
        }
    }
    
    // --- 5. DRAW HEADER HIGHLIGHTS AND TEXT ---
    const selectionRange = this.selectionArea ? {
        minRow: Math.min(this.selectionArea.start.row, this.selectionArea.end.row),
        maxRow: Math.max(this.selectionArea.start.row, this.selectionArea.end.row),
        minCol: Math.min(this.selectionArea.start.col, this.selectionArea.end.col),
        maxCol: Math.max(this.selectionArea.start.col, this.selectionArea.end.col),
    } : null;

    if (selectionRange) {
        ctx.fillStyle = headerSelectionFill;
        for (let c = selectionRange.minCol; c <= selectionRange.maxCol; c++) {
            if (c >= this.viewportStartCol && c <= this.viewportEndCol) {
                const x = this.getColX(c) - this.scrollX;
                ctx.fillRect(x, 0, this.colWidths[c], this.headerHeight);
            }
        }
        for (let r = selectionRange.minRow; r <= selectionRange.maxRow; r++) {
            if (r >= this.viewportStartRow && r <= this.viewportEndRow) {
                const y = this.getRowY(r) - this.scrollY;
                ctx.fillRect(0, y, this.headerWidth, this.rowHeights[r]);
            }
        }
    } else {
        ctx.fillStyle = excelGreen;
        for (const c of this.selectedColumns) {
            if (c >= this.viewportStartCol && c <= this.viewportEndCol) {
                const x = this.getColX(c) - this.scrollX;
                ctx.fillRect(x, 0, this.colWidths[c], this.headerHeight);
            }
        }
        for (const r of this.selectedRows) {
            if (r >= this.viewportStartRow && r <= this.viewportEndRow) {
                const y = this.getRowY(r) - this.scrollY;
                ctx.fillRect(0, y, this.headerWidth, this.rowHeights[r]);
            }
        }
    }

    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let r = this.viewportStartRow; r <= this.viewportEndRow; r++) {
        const isSelected = this.selectedRows.has(r);
        const screenY = this.getRowY(r) - this.scrollY;
        ctx.fillStyle = isSelected ? "white" : defaultHeaderTextColor;
        ctx.fillText(r.toString(), this.headerWidth / 2, screenY + this.rowHeights[r] / 2);
    }
    for (let c = this.viewportStartCol; c <= this.viewportEndCol; c++) {
        const isSelected = this.selectedColumns.has(c);
        const screenX = this.getColX(c) - this.scrollX;
        ctx.fillStyle = isSelected ? "white" : defaultHeaderTextColor;
        ctx.fillText(this.colToExcelLabel(c - 1), screenX + this.colWidths[c] / 2, this.headerHeight / 2);
    }

    // --- 6. DRAW SELECTION BORDERS (STROKES) ---
    ctx.strokeStyle = excelGreen;
    if (this.selectionArea) {
        const minRow = Math.min(this.selectionArea.start.row, this.selectionArea.end.row);
        const maxRow = Math.max(this.selectionArea.start.row, this.selectionArea.end.row);
        const minCol = Math.min(this.selectionArea.start.col, this.selectionArea.end.col);
        const maxCol = Math.max(this.selectionArea.start.col, this.selectionArea.end.col);
        const startX = this.getColX(minCol) - this.scrollX;
        const startY = this.getRowY(minRow) - this.scrollY;
        let totalWidth = 0;
        for (let i = minCol; i <= maxCol; i++) totalWidth += this.colWidths[i];
        let totalHeight = 0;
        for (let i = minRow; i <= maxRow; i++) totalHeight += this.rowHeights[i];
        
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Path for the main data area border (thin)
        ctx.rect(startX + 0.5, startY + 0.5, totalWidth, totalHeight);
        // Path for the column headers' BOTTOM border only
        const headerBottomY = this.headerHeight - 0.5;
        ctx.moveTo(startX, headerBottomY);
        ctx.lineTo(startX + totalWidth, headerBottomY);
        // Path for the row headers' RIGHT border only
        const headerRightX = this.headerWidth - 0.5;
        ctx.moveTo(headerRightX, startY);
        ctx.lineTo(headerRightX, startY + totalHeight);
        ctx.stroke();

    } else {
        // Future: Add continuous border logic for full row/col selections here if needed.
    }

    // --- 7. DRAW ACTIVE CELL BORDER (THICK) ---
    if (this.activeCell) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = excelGreen;
        const x = this.getColX(this.activeCell.col) - this.scrollX;
        const y = this.getRowY(this.activeCell.row) - this.scrollY;
        ctx.strokeRect(x + 1, y + 1, this.colWidths[this.activeCell.col] - 2, this.rowHeights[this.activeCell.row] - 2);
    }
    
    // --- 8. FINAL HEADER LINES & CORNER ---
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.strokeStyle = "#C6C6C6";
    ctx.moveTo(this.headerWidth + 0.5, 0);
    ctx.lineTo(this.headerWidth + 0.5, this.canvas.height);
    ctx.moveTo(0, this.headerHeight + 0.5);
    ctx.lineTo(this.canvas.width, this.headerHeight + 0.5);
    ctx.stroke();

    if (this.selectedRows.size > 0 && this.selectedColumns.size > 0) {
        ctx.fillStyle = "#f5f5f5";
        ctx.fillRect(0, 0, this.headerWidth, this.headerHeight);
    }
    }
     
    getMaxScrollX() {
        const totalGridWidth = this.colWidths.reduce((sum, width) => sum + width, 0) - this.headerWidth;
        const canvasWidth = this.canvas.width / this.getDPR();
        return Math.max(0, totalGridWidth - (canvasWidth - this.headerWidth));
    }
    
    getMaxScrollY() {
        const totalGridHeight = this.rowHeights.reduce((sum, height) => sum + height, 0) - this.headerHeight;
        const canvasHeight = this.canvas.height / this.getDPR();
        return Math.max(0, totalGridHeight - (canvasHeight - this.headerHeight));
    }

}