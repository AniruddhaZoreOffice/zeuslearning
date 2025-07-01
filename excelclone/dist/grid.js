import { Renderer } from "./renderer.js";
export class GridManager {
    /**
     * Intializes Grid Object
     * @param {number}height Height of grid
     * @param {number}width Width of grid
     * @param {number}totalRows Total Numbers of rows
     * @param {number}totalColumns Total Number of columns
     * @param {number}cellWidth Width of cells
     * @param {number}cellHeight Height of cells
     */
    constructor(height, width, totalRows, totalColumns, cellWidth, cellHeight) {
        this.height = height;
        this.width = width;
        this.totalRows = totalRows;
        this.totalColumns = totalColumns;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.gridContainer = document.createElement('div');
        this.gridContainer.className = "grid-container";
        this.gridContainer.style.height = height + "px";
        this.gridContainer.style.width = width + "px";
        console.log("reached grid");
        const corner = document.createElement('div');
        corner.className = "corner";
        corner.style.height = this.cellHeight + "px";
        corner.style.width = this.cellWidth + "px";
        this.columnBar = document.createElement('div');
        this.columnBar.className = "column-bar";
        this.columnBar.style.height = cellHeight + "px";
        this.columnBar.style.top = "0px";
        this.columnBar.style.left = cellWidth + "px";
        this.rowBar = document.createElement('div');
        this.rowBar.className = "row-bar";
        this.rowBar.style.width = cellWidth + "px";
        this.rowBar.style.top = cellHeight + "px";
        this.rowBar.style.left = "0px";
        this.gridContainer.appendChild(corner);
        this.gridContainer.appendChild(this.columnBar);
        this.gridContainer.appendChild(this.rowBar);
        const pager = document.createElement('div');
        pager.className = "pager";
        pager.style.height = cellHeight * totalRows + "px";
        pager.style.width = cellWidth * totalColumns + "px";
        this.gridContainer.appendChild(pager);
        this.canvas = document.createElement('canvas');
        this.canvas.className = "canvas-grid";
        const dpr = window.devicePixelRatio || 1;
        // Set the CSS size
        this.canvas.style.height = height + "px";
        this.canvas.style.width = width + "px";
        // Set the actual pixel size
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        this.canvas.style.top = cellHeight + "px";
        this.canvas.style.left = cellWidth + "px";
        this.gridContainer.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        document.body.appendChild(this.gridContainer);
        this.renderer = new Renderer(this.totalRows, this.totalColumns, this.cellWidth, this.cellHeight, this.canvas, this.gridContainer);
        this.renderer.drawGrid();
        let animationFrameId = null;
        this.gridContainer.addEventListener("scroll", () => {
            const scrollLeft = this.gridContainer.scrollLeft;
            const scrollTop = this.gridContainer.scrollTop;
            this.columnBar.style.transform = `translateX(${-scrollLeft}px)`;
            this.rowBar.style.transform = `translateY(${-scrollTop}px)`;
            this.canvas.style.transform = `translate(${scrollLeft}px, ${scrollTop}px)`;
            if (animationFrameId)
                cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(() => {
                this.renderer.drawGrid();
            });
        });
        this.renderColumnBar();
        this.renderRowBar();
    }
    /**
     * Renders Column Bar
     */
    renderColumnBar() {
        this.columnBar.innerHTML = "";
        for (let c = 0; c < this.totalColumns; c++) {
            const label = this.getColumnLabel(c);
            const cell = document.createElement('div');
            cell.className = 'column-header-cell';
            cell.style.width = `${this.cellWidth}px`;
            cell.style.borderRight = "1px solid #ccc";
            cell.textContent = label;
            this.columnBar.appendChild(cell);
        }
    }
    /**
     * Returns Excel like column names
     * @param {number} index Column number to be converted in excel like label
     * @returns {string} label
     */
    getColumnLabel(index) {
        let label = '';
        while (index >= 0) {
            label = String.fromCharCode((index % 26) + 65) + label;
            index = Math.floor(index / 26) - 1;
        }
        return label;
    }
    /**
     * Renders Row Bar
     */
    renderRowBar() {
        this.rowBar.innerHTML = "";
        for (let r = 1; r <= this.totalRows; r++) {
            const cell = document.createElement('div');
            cell.className = 'row-header-cell';
            cell.style.height = `${this.cellHeight}px`;
            cell.textContent = `${r}`;
            cell.style.borderBottom = "1px solid #ccc";
            this.rowBar.appendChild(cell);
        }
    }
}
