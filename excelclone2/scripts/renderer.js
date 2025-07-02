export class Renderer {
  totalCols;
  totalRows;
  cellWidth;
  cellHeight;
  rowBar;
  columnBar;
  canvas;
  rowBarctx;
  columnBarctx;
  ctx;
  ratio;
  lastScrollX = 0;
  lastScrollY = 0;

  constructor(
    totalCols,
    totalRows,
    cellWidth,
    cellHeight,
    rowBar,
    columnBar,
    canvas
  ) {
    this.totalCols = totalCols;
    this.totalRows = totalRows;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.rowBar = rowBar;
    this.columnBar = columnBar;
    this.canvas = canvas;

    this.ratio = window.devicePixelRatio || 1;
    this.rowBarctx = this.rowBar.getContext("2d");
    this.columnBarctx = this.columnBar.getContext("2d");
    this.ctx = this.canvas.getContext("2d");

    this.resizeCanvas(); 

    this.renderScroll(0, 0);
  }

  resizeCanvas() {
    
    this.canvas.width = this.canvas.clientWidth * this.ratio;
    this.canvas.height = this.canvas.clientHeight * this.ratio;
    this.rowBar.width = this.rowBar.clientWidth * this.ratio;
    this.rowBar.height = this.rowBar.clientHeight * this.ratio;
    this.columnBar.width = this.columnBar.clientWidth * this.ratio;
    this.columnBar.height = this.columnBar.clientHeight * this.ratio;

    
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.rowBarctx.setTransform(1, 0, 0, 1, 0, 0);
    this.columnBarctx.setTransform(1, 0, 0, 1, 0, 0);

    this.ctx.scale(this.ratio, this.ratio);
    this.rowBarctx.scale(this.ratio, this.ratio);
    this.columnBarctx.scale(this.ratio, this.ratio);

    this.renderScroll(this.lastScrollX, this.lastScrollY);
  }

  renderScroll(scrollX, scrollY) {
    this.lastScrollX = scrollX;
    this.lastScrollY = scrollY;

    const visibleCols = Math.ceil(this.canvas.clientWidth / this.cellWidth);
    const visibleRows = Math.ceil(this.canvas.clientHeight / this.cellHeight);

    const startCol = Math.floor(scrollX / this.cellWidth);
    const startRow = Math.floor(scrollY / this.cellHeight);

    const endCol = Math.min(startCol + visibleCols + 1, this.totalCols);
    const endRow = Math.min(startRow + visibleRows + 1, this.totalRows);

    // Reset transforms
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.rowBarctx.setTransform(1, 0, 0, 1, 0, 0);
    this.columnBarctx.setTransform(1, 0, 0, 1, 0, 0);
    this.scaled = false;

    // Clear areas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.rowBarctx.clearRect(0, 0, this.rowBar.width, this.rowBar.height);
    this.columnBarctx.clearRect(0, 0, this.columnBar.width, this.columnBar.height);

    // Scale only once
    if (!this.scaled) {
      this.ctx.scale(this.ratio, this.ratio);
      this.rowBarctx.scale(this.ratio, this.ratio);
      this.columnBarctx.scale(this.ratio, this.ratio);
      this.scaled = true;
    }

    // Draw grid
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 1;

    for (let row = startRow; row < endRow; row++) {
      const y = (row - startRow) * this.cellHeight;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo((endCol - startCol) * this.cellWidth, y);
      this.ctx.stroke();
    }

    for (let col = startCol; col < endCol; col++) {
      const x = (col - startCol) * this.cellWidth;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, (endRow - startRow) * this.cellHeight);
      this.ctx.stroke();
    }

    // Draw row labels
    this.rowBarctx.font = "12px Arial";
    this.rowBarctx.textAlign = "center";
    this.rowBarctx.textBaseline = "middle";
    this.rowBarctx.fillStyle = "black";
    this.rowBarctx.strokeStyle = "black";
    this.rowBarctx.lineWidth = 1;

    for (let row = startRow; row < endRow; row++) {
      const y = (row - startRow) * this.cellHeight;
      this.rowBarctx.beginPath();
      this.rowBarctx.moveTo(0, y);
      this.rowBarctx.lineTo(this.cellWidth, y);
      this.rowBarctx.stroke();
      this.rowBarctx.fillText((row + 1).toString(), this.cellWidth / 2, y + this.cellHeight / 2);
    }

    // Draw column labels
    this.columnBarctx.font = "12px Arial";
    this.columnBarctx.textAlign = "center";
    this.columnBarctx.textBaseline = "middle";
    this.columnBarctx.fillStyle = "black";
    this.columnBarctx.strokeStyle = "black";
    this.columnBarctx.lineWidth = 1;

    for (let col = startCol; col < endCol; col++) {
      const x = (col - startCol) * this.cellWidth;
      this.columnBarctx.beginPath();
      this.columnBarctx.moveTo(x, 0);
      this.columnBarctx.lineTo(x, this.cellHeight);
      this.columnBarctx.stroke();
      const label = this.getColumnLabel(col);
      this.columnBarctx.fillText(label, x + this.cellWidth / 2, this.cellHeight / 2);
    }
  }

  getColumnLabel(index) {
    let label = "";
    while (index >= 0) {
      label = String.fromCharCode((index % 26) + 65) + label;
      index = Math.floor(index / 26) - 1;
    }
    return label;
  }

  
}
