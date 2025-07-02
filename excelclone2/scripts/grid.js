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
    ){  
        this.height = height
        this.width = width
        this.totalCols = totalCols
        this.totalRows = totalRows
        this.cellWidth = cellWidth
        this.cellHeight = cellHeight

        this.gridContainer = document.createElement("div")
        this.gridContainer.className = "grid-container"
        this.gridContainer.style.height = this.height + "px"
        this.gridContainer.style.width = this.width + "px"

        this.rowBar = document.createElement("canvas")
        this.rowBar.className = "row-bar"
        this.rowBar.style.height = "100%";
        this.rowBar.style.width = this.cellWidth + "px"
        this.rowBar.style.top= this.cellHeight + "px"

        this.columnBar = document.createElement("canvas")
        this.columnBar.className = "column-bar"
        this.columnBar.style.height= this.cellHeight + "px";
        this.columnBar.style.width = "100%"
        this.columnBar.style.left= this.cellWidth + "px"

        this.corner = document.createElement("div")
        this.corner.className = "corner"
        this.corner.style.height= this.cellHeight + "px";
        this.corner.style.width = this.cellWidth + "px"
        this.corner.style.left= "0px"
        this.corner.style.top = "0px"
        
        this.pager = document.createElement("div");
        this.pager.style.width = `${this.totalCols * this.cellWidth}px`;
        this.pager.style.height = `${this.totalRows * this.cellHeight}px`;
        this.pager.style.position = "absolute";
        this.pager.style.top = this.cellHeight + "px";
        this.pager.style.left = this.cellWidth + "px";
        this.pager.style.pointerEvents = "none";
        this.pager.style.zIndex = "-1";

        this.canvas = document.createElement("canvas")
        this.canvas.className = "main-canvas"
        this.canvas.style.top = cellHeight + "px"
        this.canvas.style.left = cellWidth + "px"
        this.canvas.style.height = "100%"
        this.canvas.style.width = "100%"

        this.canvas.style.position = "absolute";
        this.rowBar.style.position = "absolute";
        this.columnBar.style.position = "absolute";
        this.corner.style.position = "absolute";
        this.gridContainer.style.position = "relative";
        this.gridContainer.style.overflow = "auto"

        document.body.appendChild(this.gridContainer)
        this.gridContainer.appendChild(this.corner)
        this.gridContainer.appendChild(this.columnBar)
        this.gridContainer.appendChild(this.rowBar)
        this.gridContainer.appendChild(this.pager);
        this.gridContainer.appendChild(this.canvas)
        
        const canvasRenderer = new Renderer(
             this.totalCols ,
             this.totalRows ,
             this.cellWidth ,
             this.cellHeight ,
             this.rowBar ,
             this.columnBar , 
             this.canvas 
        )

        this.gridContainer.addEventListener("scroll", (e) => {
          const scrollX = this.gridContainer.scrollLeft;
          const scrollY = this.gridContainer.scrollTop;
        
          this.columnBar.style.transform = `translateX(${-scrollX}px)`;
          this.rowBar.style.transform = `translateY(${-scrollY}px)`;
        
          canvasRenderer.renderScroll(scrollX, scrollY);
        });
        window.addEventListener("resize", () => {
          canvasRenderer.resizeCanvas();
        });
    }
}