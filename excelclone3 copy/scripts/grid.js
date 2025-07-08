import ResizeHandler from "./resizeHandler.js";
import SelectionHandler from "./SelectionHandler.js";
import dataStorage from "./dataStorage.js";
import CellEditor from "./cellEditor.js";

export default class Grid {
    /**
     * 
     * @param {String} width Width of the grid container
     * @param {String} height Height of the grid container
     * @param {Number} rows Total rows in grid
     * @param {Number} cols Total columns in grid
     * @param {Number} defaultCellWidth Default Cell width
     * @param {Number} defaultCellHeight Default Cell height
     */
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

        this.resizeHandler = new ResizeHandler(this);
        this.selectionHandler = new SelectionHandler(this);
        this.CellEditor = new CellEditor(this)

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
        
        this.canvas.addEventListener('dblclick',this.handleDoubleClick.bind(this))
       


        this.renderLoop();
    }
    
    /**
     * Returns Device Pixel Ratio
     * @returns Pixel Ratio
     */
    getDPR() {
        return window.devicePixelRatio || 1;
    }
    
    /**
     * Updates Scrollbar line Size
     */
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
    
    /**
     * Updates canvas and scrollbar size according to Pixel ratio and requests redraw
     */
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
    
    
    /**
     * Calculates Visible area of grid to render rows and columns
     */
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
    
    /**
     * Returns Excel like label of columns
     * @param {Number} col Column Number
     * @returns String label 
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
     * Returns horizontal distance of a column from origin
     * @param {Number} col Column Number
     * @returns X co-ordinate of a column
     */
    getColX(col) {
        let x = this.headerWidth;
        for (let c = 1; c < col; c++) x += this.colWidths[c];
        return x;
    }
    
    /**
     * Returns vertical distance of a row from origin
     * @param {Number} row Row Number
     * @returns Y co-ordinate of a row
     */
    getRowY(row) {
        let y = this.headerHeight;
        for (let r = 1; r < row; r++) y += this.rowHeights[r];
        return y;
    }
    
    /**
     * Returns Column at x distance 
     * @param {Number} x Distance along x-axis 
     * @returns Column Number
     */
    colAtX(x) {
        let px = this.headerWidth;
        for (let c = 1; c < this.cols; c++) {
            if (x < px + this.colWidths[c]) return c;
            px += this.colWidths[c];
        }
        return null;
    }
    
    /**
     * Returns Row at y distance 
     * @param {Number} y Distnace along y-axis
     * @returns Row Number
     */
    rowAtY(y) {
        let py = this.headerHeight;
        for (let r = 1; r < this.rows; r++) {
            if (y < py + this.rowHeights[r]) return r;
            py += this.rowHeights[r];
        }
        return null;
    }
    
    /**
     * Renders Grid on according to animation frame
     */
    renderLoop() {
        requestAnimationFrame(this.renderLoop.bind(this));
        if (this.needsRedraw) {
            this.drawGrid();
            this.needsRedraw = false;
        }
    }
    
    /**
     * Makes a grid redraw
     */
    requestRedraw() {
        this.needsRedraw = true;
    }
    
    /**
     * Returns Width of particular column
     * @param {Number} index Column Number
     * @returns Column Width
     */
    getColWidth(index) {
        return this.colWidths[index];
    }
    
    /**
     * Sets Width of a column and redraws grid
     * @param {Number} index Column Number
     * @param {Number} width Width of Column
     */
    setColumnWidth(index, width) {
        this.colWidths[index] = width;
        this.requestRedraw();
    }
    
    /**
     * Returns Height of particular row
     * @param {Number} index Row Number
     * @returns Row Height
     */
    getRowHeight(index) {
        return this.rowHeights[index];
    }
    
    /**
     * Sets height of a row and redraws grid
     * @param {Number} index Row Number
     * @param {Number} height Row Height 
     */
    setRowHeight(index, height) {
        this.rowHeights[index] = height;
        this.requestRedraw();
    }
    
    /**
     * Sets appearance of a Mouse cursor
     * @param {String} style Cursor style Name
     */
    setCursor(style) {
        this.canvas.style.cursor = style;
    }
    
    /**
     * Sets event listeners with respect to Selection tasks
     */
    addSelectionWindowListeners() {
        window.addEventListener('mousemove', this.boundSelectionMouseMove);
        window.addEventListener('mouseup', this.boundSelectionMouseUp);
    }
    
    /**
     * Removes event listeners with respect to Selection tasks
     */
    removeSelectionWindowListeners() {
        window.removeEventListener('mousemove', this.boundSelectionMouseMove);
        window.removeEventListener('mouseup', this.boundSelectionMouseUp);
    }
    
    /**
     * Draws grid lines and sets grid styles
     */
    drawGrid() {
        this.calculateViewport();
        const ctx = this.ctx;
    
        const excelGreen = '#107C41';
        const selectionFill = '#E9F5EE';
        const headerSelectionFill = '#CCFFCC';
        const defaultHeaderTextColor = '#555';
        const defaultGridLineColor = '#DCDCDC';
    
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = "#f5f5f5";
        ctx.fillRect(0, 0, this.canvas.width, this.headerHeight);
        ctx.fillRect(0, 0, this.headerWidth, this.canvas.height);

       
    
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
            
            const selectedColumns = Array.from(this.selectedColumns);
           const selectedRows = Array.from(this.selectedRows).filter(
                r => r >= this.viewportStartRow && r <= this.viewportEndRow
            );
            
            const hasSelection = selectedColumns.length > 0 || selectedRows.length > 0;
            
            

            //highlight selected columns
            for (const c of this.selectedColumns) {
                if (c >= this.viewportStartCol && c <= this.viewportEndCol) {
                    const x = this.getColX(c) - this.scrollX;
                    ctx.fillStyle = selectionFill;
                    ctx.fillRect(x, this.headerHeight, this.colWidths[c], this.canvas.height);
                }
            }
            

            //highlight selected rows
            for (const r of this.selectedRows) {
                if (r >= this.viewportStartRow && r <= this.viewportEndRow) {
                    const y = this.getRowY(r) - this.scrollY;
                    ctx.fillStyle = selectionFill;
                    ctx.fillRect(this.headerWidth, y, this.canvas.width, this.rowHeights[r]);
                    
                }
            }
            

            if (hasSelection) {
                const col = selectedColumns.length > 0 ? selectedColumns[0] : 0;
                const row = selectedRows.length > 0 ? selectedRows[0] : 0;
            
                this.intialCell = { row, col };
            
                // Draw white cell at intersection
                const x = this.getColX(col) - this.scrollX;
                const y = this.getRowY(row) - this.scrollY;
                ctx.fillStyle = "#fff";
                ctx.fillRect(x, y, this.colWidths[col], this.rowHeights[row]);
            }
        }
        
        ctx.lineWidth = 1
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
    
        ctx.font = "14px Arial";
        ctx.fillStyle = "#333";
        ctx.textBaseline = "middle";
        for (let r = this.viewportStartRow; r <= this.viewportEndRow; r++) {
            for (let c = this.viewportStartCol; c <= this.viewportEndCol; c++) {
                const value = this.dataStorage.getCellValue(r, c);
                if (this.isEditing && this.activeCell.row === r && this.activeCell.col === c) {
                    continue;
                }

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
        
        const selectionRange = this.selectionArea ? {
            minRow: Math.min(this.selectionArea.start.row, this.selectionArea.end.row),
            maxRow: Math.max(this.selectionArea.start.row, this.selectionArea.end.row),
            minCol: Math.min(this.selectionArea.start.col, this.selectionArea.end.col),
            maxCol: Math.max(this.selectionArea.start.col, this.selectionArea.end.col),
        } : null;
        
        //render header styles on cell or range selection
        if (selectionRange) {
            ctx.fillStyle = headerSelectionFill;
            for (let c = selectionRange.minCol; c <= selectionRange.maxCol; c++) {
                if (c >= this.viewportStartCol && c <= this.viewportEndCol) {
                    const x = this.getColX(c) - this.scrollX;
                    ctx.fillRect(x, 0, this.colWidths[c], this.headerHeight);
                    
                    const borderX = x + this.colWidths[c] - 0.5; 
                    
                    ctx.beginPath(); 
                    ctx.strokeStyle = defaultGridLineColor;
                    ctx.lineWidth = 1; 
                    
                    ctx.moveTo(borderX, 0); 
                    ctx.lineTo(borderX, this.headerHeight); 
                    
                    ctx.stroke();
                }
            }
            for (let r = selectionRange.minRow; r <= selectionRange.maxRow; r++) {
                if (r >= this.viewportStartRow && r <= this.viewportEndRow) {
                    const y = this.getRowY(r) - this.scrollY;
                    ctx.fillRect(0, y, this.headerWidth, this.rowHeights[r]);
                    const borderY = y + this.rowHeights[r] - 0.5; 
                
                    ctx.beginPath(); 
                    ctx.strokeStyle = defaultGridLineColor;
                    ctx.lineWidth = 1; 
                    
                    ctx.moveTo(0 , borderY); 
                    ctx.lineTo(this.headerWidth, borderY); 
                    
                    ctx.stroke();
                }
            }
        } else {
            
            for (const c of this.selectedColumns) {
                if (c >= this.viewportStartCol && c <= this.viewportEndCol) {
                    const x = this.getColX(c) - this.scrollX;
                    ctx.fillStyle = excelGreen;
                    ctx.fillRect(x, 0, this.colWidths[c], this.headerHeight);
                }
            }
            for (const r of this.selectedRows) {
                if (r >= this.viewportStartRow && r <= this.viewportEndRow) {
                    const y = this.getRowY(r) - this.scrollY;
                    ctx.fillStyle = excelGreen;
                    ctx.fillRect(0, y, this.headerWidth, this.rowHeights[r]);
                }
            }
            if(Array.from(this.selectedColumns).length > 0 ){
                   for (let r = 0; r <= this.viewportEndRow; r++) {
                   if (r >= this.viewportStartRow && r <= this.viewportEndRow) {
                       const y = this.getRowY(r) - this.scrollY;
                       ctx.fillStyle = headerSelectionFill
                       ctx.fillRect(0, y, this.headerWidth, this.rowHeights[r]);

                       const startY = this.getRowY(this.viewportStartRow) - this.scrollY;
                       let totalVisibleHeight = 0;
                       for (let r = this.viewportStartRow; r <= this.viewportEndRow; r++) {
                           totalVisibleHeight += this.rowHeights[r];
                               const y = this.getRowY(r) - this.scrollY;
                               ctx.fillRect(0, y, this.headerWidth, this.rowHeights[r]);
                               const borderY = y + this.rowHeights[r] - 0.5; 
                    
                               ctx.beginPath(); 
                               ctx.strokeStyle = defaultGridLineColor;
                               ctx.lineWidth = 1; 
                               
                               ctx.moveTo(0 , borderY); 
                               ctx.lineTo(this.headerWidth, borderY); 
                               
                               ctx.stroke();
                       }
                       const borderX = this.headerWidth - 0.5; 

                       ctx.beginPath(); 
                       ctx.strokeStyle = excelGreen;
                       ctx.lineWidth = 2; 
                       ctx.moveTo( borderX,startY);
                       ctx.lineTo( borderX,startY + totalVisibleHeight);
                       ctx.stroke();
                   }
                   
                   }
            }
            if(Array.from(this.selectedRows).length > 0 ){
                   for (let c = 0; c <= this.viewportEndCol; c++) {
                   if (c >= this.viewportStartCol && c <= this.viewportEndCol) {
                       const x = this.getColX(c) - this.scrollX;
                       ctx.fillStyle = headerSelectionFill
                       ctx.fillRect(x, 0, this.colWidths[c], this.headerHeight);

                       const startX = this.getColX(this.viewportStartCol) - this.scrollX;
                       let totalVisibleWidth = 0;
                       for (let c = this.viewportStartCol; c <= this.viewportEndCol; c++) {
                           totalVisibleWidth += this.colWidths[c];

                           const x = this.getColX(c) - this.scrollX;
                           ctx.fillRect(x, 0, this.colWidths[c], this.headerHeight);
                           
                           const borderX = x + this.colWidths[c] - 0.5; 
                           
                           ctx.beginPath(); 
                           ctx.strokeStyle = defaultGridLineColor;
                           ctx.lineWidth = 1; 
                           
                           ctx.moveTo(borderX, 0); 
                           ctx.lineTo(borderX, this.headerHeight); 
                           
                           ctx.stroke();
                        }
                       const borderY = this.headerHeight - 0.5; 

                       ctx.beginPath(); 
                       ctx.strokeStyle = excelGreen;
                       ctx.lineWidth = 2; 
                       ctx.moveTo(startX, borderY);
                       ctx.lineTo(startX + totalVisibleWidth, borderY);
                       ctx.stroke();
                    }
            }
            
            }
        }
        // to render headers
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
        
        // to render selection area (range selection)
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
            
            ctx.lineWidth = 1/this.getDPR();
            ctx.beginPath();
            
            ctx.rect(startX , startY , totalWidth, totalHeight);
            
            const headerBottomY = this.headerHeight - 0.5;
            ctx.moveTo(startX, headerBottomY);
            ctx.lineTo(startX + totalWidth, headerBottomY);
            
            const headerRightX = this.headerWidth - 0.5;
            ctx.moveTo(headerRightX, startY);
            ctx.lineTo(headerRightX, startY + totalHeight);
            ctx.stroke();
    
        } 

        if (this.activeCell) {
            ctx.lineWidth = 2;
            ctx.strokeStyle = excelGreen;
            const x = this.getColX(this.activeCell.col) - this.scrollX;
            const y = this.getRowY(this.activeCell.row) - this.scrollY;
            ctx.strokeRect(x + 1, y + 1, this.colWidths[this.activeCell.col] - 2, this.rowHeights[this.activeCell.row] - 2);
        }
       
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
        ctx.save()
            ctx.strokeStyle = excelGreen;
            ctx.lineWidth = 2;
            
            if(Array.from(this.selectedRows).length > 0){
                const firstSelectedRow = Array.from(this.selectedRows)[0];
                const lastSelectedRow = Array.from(this.selectedRows).at(-1);
                const upperBorderY = this.getRowY(firstSelectedRow)  - this.scrollY;
                const lowerBorderY = this.getRowY(lastSelectedRow) + this.getRowHeight(lastSelectedRow) - this.scrollY;
            
                const startX = this.headerWidth; 
                const endX = this.canvas.width;  
                
                ctx.beginPath();
                ctx.moveTo(startX,upperBorderY);
                ctx.lineTo(endX,upperBorderY);
                ctx.stroke();
                
                 
                ctx.beginPath()
                ctx.moveTo(startX,lowerBorderY)
                ctx.lineTo(endX, lowerBorderY)
                ctx.stroke()
            }

            if(Array.from(this.selectedColumns).length > 0){
                const firstSelectedCol = Array.from(this.selectedColumns)[0];
                const lastSelectedCol = Array.from(this.selectedColumns).at(-1);
                const leftborderX = this.getColX(firstSelectedCol)  - this.scrollX;
                const rightBorderX = this.getColX(lastSelectedCol) + this.getColWidth(lastSelectedCol) - this.scrollX;
            
                const startY = this.headerHeight; 
                const endY = this.canvas.height;  
                 
                ctx.beginPath();
                ctx.moveTo(leftborderX, startY);
                ctx.lineTo(leftborderX, endY);
                ctx.stroke();
                
                 
                ctx.beginPath()
                ctx.moveTo(rightBorderX, startY)
                ctx.lineTo(rightBorderX, endY)
                ctx.stroke()
            }
            ctx.restore()
        
    }
    
    /**
     * Returns maximum scrolling along x-axis 
     * @returns Max ScrollX
     */
    getMaxScrollX() {
        const totalGridWidth = this.colWidths.reduce((sum, width) => sum + width, 0) - this.headerWidth;
        const canvasWidth = this.canvas.width / this.getDPR();
        return Math.max(0, totalGridWidth - (canvasWidth - this.headerWidth));
    }
    
    /**
     * Returns maximum scrolling along y-axis 
     * @returns Max ScollY
     */
    getMaxScrollY() {
        const totalGridHeight = this.rowHeights.reduce((sum, height) => sum + height, 0) - this.headerHeight;
        const canvasHeight = this.canvas.height / this.getDPR();
        return Math.max(0, totalGridHeight - (canvasHeight - this.headerHeight));
    }
    
    
    handleDoubleClick(event){
        if (this.activeCell && !this.isEditing) {
            this.startEditing();
        }
    }


    startEditing(clearContent = false) {
        if (!this.activeCell || this.CellEditor.isActive()) return;
        this.CellEditor.startEditing(this.activeCell);
        if (clearContent) {
            this.CellEditor.input.value = '';
        }
    }


}