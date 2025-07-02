import {Renderer} from "./renderer.js"

export class Grid{
    gridContainer
    height
    width
    totalCols
    totalRows
    cellWidth
    cellHeight
    rowBar 
    columnBar 
    corner 
    canvas

     constructor(
        height,
        width,
        totalCols,
        totalRows,
        cellWidth,
        cellHeight,
    ) {
        this.height = height;
        this.width = width;
        this.totalCols = totalCols;
        this.totalRows = totalRows;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;

        this.gridContainer = document.createElement("div");
        this.gridContainer.className = "grid-container";
        this.gridContainer.style.height = this.height + "px";
        this.gridContainer.style.width = this.width + "px";
        this.gridContainer.style.position = "relative";
        this.gridContainer.style.overflow = "auto";

        // --- Corner: Sticks to the top-left ---
        this.corner = document.createElement("div");
        this.corner.className = "corner";
        this.corner.style.position = "sticky"; // CHANGE
        this.corner.style.height = this.cellHeight + "px";
        this.corner.style.width = this.cellWidth + "px";
        this.corner.style.left = "0px";
        this.corner.style.top = "0px";
        this.corner.style.zIndex = "3";
        this.corner.style.backgroundColor = "#f0f0f0"; // Add a background for clarity

        // --- Column Bar: Sticks to the top ---
        this.columnBar = document.createElement("canvas");
        this.columnBar.className = "column-bar";
        this.columnBar.style.position = "sticky"; // CHANGE
        this.columnBar.style.top = "0px"; // CHANGE
        this.columnBar.style.height = this.cellHeight + "px";
        this.columnBar.style.width = "100%"; // This is now correct for sticky
        this.columnBar.style.left = this.cellWidth + "px";
        this.columnBar.style.zIndex = "2";

        // --- Row Bar: Sticks to the left ---
        this.rowBar = document.createElement("canvas");
        this.rowBar.className = "row-bar";
        this.rowBar.style.position = "sticky"; // CHANGE
        this.rowBar.style.left = "0px"; // CHANGE
        this.rowBar.style.height = "100%"; // This is now correct for sticky
        this.rowBar.style.width = this.cellWidth + "px";
        this.rowBar.style.top = this.cellHeight + "px";
        this.rowBar.style.zIndex = "2";

        // --- Pager (for scrollbar size) ---
        this.pager = document.createElement("div");
        this.pager.style.width = `${this.totalCols * this.cellWidth}px`;
        this.pager.style.height = `${this.totalRows * this.cellHeight}px`;
        this.pager.style.position = "absolute"; // Keep as absolute
        this.pager.style.top = this.cellHeight + "px";
        this.pager.style.left = this.cellWidth + "px";
        this.pager.style.pointerEvents = "none";
        this.pager.style.zIndex = "-1";

        // --- Main Canvas ---
        this.canvas = document.createElement("canvas");
        this.canvas.className = "main-canvas";
        this.canvas.style.position = "absolute"; // Keep as absolute
        this.canvas.style.top = cellHeight + "px";
        this.canvas.style.left = cellWidth + "px";
        // Let the renderer size it
        this.canvas.style.height = "100%";
        this.canvas.style.width = "100%";
        this.canvas.style.zIndex = "1";
        
        // Append in the correct order for stacking/stickiness
        document.body.appendChild(this.gridContainer);
        this.gridContainer.appendChild(this.pager);
        this.gridContainer.appendChild(this.canvas);
        this.gridContainer.appendChild(this.columnBar);
        this.gridContainer.appendChild(this.rowBar);
        this.gridContainer.appendChild(this.corner); // Append corner last to be on top

        const canvasRenderer = new Renderer(
            this.totalCols,
            this.totalRows,
            this.cellWidth,
            this.cellHeight,
            this.rowBar,
            this.columnBar,
            this.canvas
        );

        this.gridContainer.addEventListener("scroll", (e) => {
            const scrollX = this.gridContainer.scrollLeft;
            const scrollY = this.gridContainer.scrollTop;
          
                    
          canvasRenderer.renderScroll(scrollX, scrollY);
        });
        window.addEventListener("resize", () => {
          canvasRenderer.resizeCanvas();
        });
    }
}