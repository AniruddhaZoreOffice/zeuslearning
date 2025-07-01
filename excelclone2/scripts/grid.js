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

        this.rowBar = document.createElement("div")
        this.rowBar.style.height = "100%";
        this.rowBar.style.width = this.cellWidth + "px"
        this.rowBar.style.top= this.cellHeight + "px"

        this.columnBar = document.createElement("div")
        this.columnBar.style.height= this.cellHeight;
        this.columnBar.style.width = "100%"
        this.columnBar.style.left= this.cellWidth + "px"

        this.corner = document.createElement("div")
        this.corner.style.height= this.cellHeight;
        this.corner.style.width = this.cellWidth
        this.corner.style.left= "0px"
        this.corner.style.top = "0px"

        this.canvas = document.createElement("canvas")
        this.ctx = this.canvas.getContext("2d")  
        this.canvas.style.top = cellHeight
        this.canvas.style.left = cellWidth
        this.canvas.style.height = "100%"
        this.canvas.style.width = "100%"

        document.body.appendChild(this.gridContainer)
        this.gridContainer.appendChild(this.corner)
        this.gridContainer.appendChild(this.columnBar)
        this.gridContainer.appendChild(this.rowBar)
        this.gridContainer.appendChild(this.canvas)
    }
}