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
    ctx 

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

        this.rowBar = document.createElement("div")
        this.rowBar.className = "row-bar"
        this.rowBar.style.height = "-webkit-fill-available";
        this.rowBar.style.width = this.cellWidth + "px"
        this.rowBar.style.top= this.cellHeight + "px"

        this.columnBar = document.createElement("div")
        this.columnBar.className = "column-bar"
        this.columnBar.style.height= this.cellHeight + "px";
        this.columnBar.style.width = "-webkit-fill-available"
        this.columnBar.style.left= this.cellWidth + "px"

        this.corner = document.createElement("div")
        this.corner.className = "corner"
        this.corner.style.height= this.cellHeight + "px";
        this.corner.style.width = this.cellWidth + "px"
        this.corner.style.left= "0px"
        this.corner.style.top = "0px"

        this.canvas = document.createElement("canvas")
        this.canvas.className = "main-canvas"
        this.ctx = this.canvas.getContext("2d")  
        this.canvas.style.top = cellHeight + "px"
        this.canvas.style.left = cellWidth + "px"
        this.canvas.style.height = "-webkit-fill-available"
        this.canvas.style.width = "-webkit-fill-available"

        this.canvas.style.position = "absolute";
        this.rowBar.style.position = "absolute";
        this.columnBar.style.position = "absolute";
        this.corner.style.position = "absolute";
        this.gridContainer.style.position = "relative";

        document.body.appendChild(this.gridContainer)
        this.gridContainer.appendChild(this.corner)
        this.gridContainer.appendChild(this.columnBar)
        this.gridContainer.appendChild(this.rowBar)
        this.gridContainer.appendChild(this.canvas)
        
        this.columnBar.style.backgroundColor = "green"
        this.corner.style.backgroundColor = "yellow"
        this.rowBar.style.backgroundColor = "pink"
        this.canvas.style.backgroundColor ="black"
    }
}