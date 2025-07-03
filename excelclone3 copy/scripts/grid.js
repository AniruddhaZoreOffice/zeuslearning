export default class Grid {
    constructor( width,height,rows, cols, defaultCellWidth, defaultCellHeight) {
        this.container = document.createElement("div")
        this.container.className = "grid-container"
        this.container.style.width = width 
        this.container.style.height = height

        this.canvas = document.createElement("canvas")
        this.canvas.id = "gridCanvas"

        this.hScrollbar = document.createElement("div")
        this.hScrollbar.classList.add("scrollbar-container")
        this.hScrollbar.classList.add("scrollbar-h")

        this.vScrollbar = document.createElement("div")
        this.vScrollbar.classList.add("scrollbar-container")
        this.vScrollbar.classList.add("scrollbar-v")
        
        this.hScrollContent = document.createElement("div")
        this.hScrollContent.id = "hScrollContent"
        this.hScrollContent.class = "scrollbar-content-h"

        this.vScrollContent = document.createElement("div")
        this.vScrollContent.id = "vScrollContent"
        this.vScrollContent.class = "scrollbar-content-v"

        this.hScrollbar.appendChild(this.hScrollContent)
        this.vScrollbar.appendChild(this.vScrollContent)

        this.container.appendChild(this.canvas)
        this.container.appendChild(this.hScrollbar)
        this.container.appendChild(this.vScrollbar)

        document.body.appendChild(this.container)

        this.cellData = new Map();
        this.scrollX = 0;
        this.scrollY = 0;
        this.selectedColumns = new Set(); 
        this.selectedRows = new Set();
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

    drawGrid() {
        this.calculateViewport();
        const ctx = this.ctx;
        
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const bodyHighlightStyle = 'rgba(50, 150, 255, 0.15)';
        const headerHighlightStyle = 'rgba(50, 150, 255, 0.25)';

        for (let c = this.viewportStartCol; c <= this.viewportEndCol; c++) {
            if (this.selectedColumns.has(c)) {
                const x = this.getColX(c) - this.scrollX;
                const width = this.colWidths[c];
                ctx.fillStyle = bodyHighlightStyle;
                ctx.fillRect(x, 0, width, this.canvas.height);
                ctx.fillStyle = headerHighlightStyle;
                ctx.fillRect(x, 0, width, this.headerHeight);
            }
        }
        for (let r = this.viewportStartRow; r <= this.viewportEndRow; r++) {
            if (this.selectedRows.has(r)) {
                const y = this.getRowY(r) - this.scrollY;
                const height = this.rowHeights[r];
                ctx.fillStyle = bodyHighlightStyle;
                ctx.fillRect(0, y, this.canvas.width, height);
                ctx.fillStyle = headerHighlightStyle;
                ctx.fillRect(0, y, this.headerWidth, height);
            }
        }
        
        ctx.beginPath();
        ctx.strokeStyle = "#ddd";
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

        ctx.beginPath();
        ctx.strokeStyle = "rgba(50, 150, 255, 1.0)";
        ctx.lineWidth = 1;
        for (let c = this.viewportStartCol; c <= this.viewportEndCol; c++) {
            if (this.selectedColumns.has(c)) {
                const x = this.getColX(c) - this.scrollX;
                const width = this.colWidths[c];
                ctx.moveTo(x + 0.5, 0);
                ctx.lineTo(x + 0.5, this.canvas.height);
                ctx.moveTo(x + width + 0.5, 0);
                ctx.lineTo(x + width + 0.5, this.canvas.height);
            }
        }
        for (let r = this.viewportStartRow; r <= this.viewportEndRow; r++) {
            if (this.selectedRows.has(r)) {
                ctx.strokeStyle = "rgba(50, 150, 255, 1.0)";
                const y = this.getRowY(r) - this.scrollY;
                const height = this.rowHeights[r];
                ctx.moveTo(0, y + 0.5);
                ctx.lineTo(this.canvas.width, y + 0.5);
                ctx.moveTo(0, y + height + 0.5);
                ctx.lineTo(this.canvas.width, y + height + 0.5);
            }
        }
        ctx.stroke();
        ctx.lineWidth = 1;

        ctx.font = "14px Arial";
        ctx.fillStyle = "#333";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (let r = this.viewportStartRow; r <= this.viewportEndRow; r++) {
            for (let c = this.viewportStartCol; c <= this.viewportEndCol; c++) {
                const value = this.getCellValue(r, c);
                if (value) {
                    const screenX = this.getColX(c) - this.scrollX;
                    const screenY = this.getRowY(r) - this.scrollY;
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(screenX + 2, screenY, this.colWidths[c] - 4, this.rowHeights[r]);
                    ctx.clip();
                    ctx.textAlign = "left";
                    ctx.fillText(value, screenX + 4, screenY + this.rowHeights[r] / 2);
                    ctx.restore();
                }
            }
        }
        
        ctx.fillStyle = "#f5f5f5";
        ctx.fillRect(0, 0, this.canvas.width, this.headerHeight);
        ctx.fillRect(0, 0, this.headerWidth, this.headerHeight);
        
        ctx.font = "12px Arial";
        ctx.fillStyle = "#666";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (let r = this.viewportStartRow; r <= this.viewportEndRow; r++) {
            const screenY = this.getRowY(r) - this.scrollY;
            ctx.fillText(r.toString(), this.headerWidth / 2, screenY + this.rowHeights[r] / 2);
        }
        for (let c = this.viewportStartCol; c <= this.viewportEndCol; c++) {
            const screenX = this.getColX(c) - this.scrollX;
            ctx.fillText(this.colToExcelLabel(c - 1), screenX + this.colWidths[c] / 2, this.headerHeight / 2);
        }

        ctx.beginPath();
        ctx.strokeStyle = "#ddd";
        ctx.moveTo(this.headerWidth + 0.5, 0);
        ctx.lineTo(this.headerWidth + 0.5, this.canvas.height);
        ctx.moveTo(0, this.headerHeight + 0.5);
        ctx.lineTo(this.canvas.width, this.headerHeight + 0.5);
        ctx.stroke();

        ctx.fillStyle = "#333";
        ctx.fillText("", this.headerWidth / 2, this.headerHeight / 2);
    }
}