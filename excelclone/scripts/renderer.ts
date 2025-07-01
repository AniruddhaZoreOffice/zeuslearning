export class Renderer {
    private totalRows: number;
    private totalColumns: number;
    private cellWidth: number;
    private cellHeight: number;
    private canvas: HTMLCanvasElement;
    private container: HTMLElement;
    private ctx: CanvasRenderingContext2D;
    
    /**
     * Initializes Renderer which would render the grid
     * @param totalRows 
     * @param totalColumns 
     * @param cellWidth 
     * @param cellHeight 
     * @param canvas 
     * @param container 
     */
    constructor(
        totalRows: number,
        totalColumns: number,
        cellWidth: number,
        cellHeight: number,
        canvas: HTMLCanvasElement,
        container: HTMLElement
    ) {
        this.totalRows = totalRows;
        this.totalColumns = totalColumns;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.canvas = canvas;
        this.container = container;

       const dpr = window.devicePixelRatio || 1;
       const ctx = canvas.getContext("2d");
       if (!ctx) throw new Error("Canvas context is null");
       ctx.scale(dpr, dpr);
       
       this.ctx = ctx;
    }
    
    /**
     * Draws grid of horizontal and vertical lines
     */
   drawGrid(): void {
    const scrollLeft = this.container.scrollLeft;
    const scrollTop = this.container.scrollTop;

    const startCol = Math.floor(scrollLeft / this.cellWidth);
    const endCol = Math.min(
        this.totalColumns - 1,
        Math.ceil((scrollLeft + this.canvas.width) / this.cellWidth)
    );

    const startRow = Math.floor(scrollTop / this.cellHeight);
    const endRow = Math.min(
        this.totalRows - 1,
        Math.ceil((scrollTop + this.canvas.height) / this.cellHeight)
    );

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            const x = col * this.cellWidth;
            const y = row * this.cellHeight;

            this.ctx.fillStyle = "#ffffff";
            this.ctx.fillRect(Math.round(x), Math.round(y), this.cellWidth, this.cellHeight);

            this.ctx.strokeStyle = "#ccc";
            this.ctx.strokeRect(Math.round(x), Math.round(y), this.cellWidth, this.cellHeight);
        }
    }
}

}
