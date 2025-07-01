const container = document.querySelector('.container') as HTMLElement;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const cellWidth = 63.5;
const cellHeight = 19.5;
const totalCols = 500;
const totalRows = 100000;
const ratio = window.devicePixelRatio || 1;

//class : Cell
class Cell{
  row : number
  col: number
  value : String
  constructor(row,col,val){
    this.row = row 
    this.col = col
    this.value = val
  }
}

const cells : Cell[][] = [];

function generateCells(){
  for(let i = 1; i <= totalRows;i++){
    for(let j=1; j<= totalCols;j++){
        cells[i][j] = new Cell(i,j,"");
    }
  }
}

// Sync canvas size with container 
function syncCanvasSize() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  canvas.width = width * ratio;
  canvas.height = height * ratio;

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

let animationFrameId: number;

// Handle scroll and resize events with requestAnimationFrame for performance
function onScrollOrResize() {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  animationFrameId = requestAnimationFrame(render);
}

container.addEventListener('scroll', onScrollOrResize);
window.addEventListener('resize', onScrollOrResize);
window.addEventListener('DOMContentLoaded', render);

// Function to convert column index to Excel-style column name
function getExcelColumnName(col: number): string {
  let name = '';
  while (col >= 0) {
    name = String.fromCharCode((col % 26) + 65) + name;
    col = Math.floor(col / 26) - 1;
  }
  return name;
}

// Render column and row bars
function renderColumnBar(scrollLeft: number) {
  const columnBar = document.getElementById("columnBar")!;
  columnBar.innerHTML = '';
  const startCol = Math.floor(scrollLeft / cellWidth);
  const endCol = Math.min(totalCols - 1, Math.ceil((scrollLeft + container.clientWidth) / cellWidth));
  
  for (let col = startCol; col <= endCol; col++) {
    const div = document.createElement('div');
    const resizer = document.createElement("div")
    resizer.className = "resizer-col"

    div.textContent = getExcelColumnName(col); 
    div.style.position = 'absolute';
    div.style.left = `${col * cellWidth - scrollLeft}px`;
    div.style.width = `${cellWidth}px`;
    div.style.height = '19px';
    div.style.lineHeight = '19px';
    div.style.textAlign = 'center';
    div.style.borderRight = '1px solid #ccc';

    div.appendChild(resizer)
    columnBar.appendChild(div);
  }
}

function renderRowBar(scrollTop: number) {
  const rowBar = document.getElementById("rowBar")!;
  rowBar.innerHTML = ''; 
  const startRow = Math.floor(scrollTop / cellHeight);
  const endRow = Math.min(totalRows - 1, Math.ceil((scrollTop + container.clientHeight) / cellHeight));
  
  for (let row = startRow; row <= endRow; row++) {
    const div = document.createElement('div');
    div.textContent = `${row}`;
    div.style.position = 'absolute';
    div.style.top = `${row * cellHeight - scrollTop}px`;
    div.style.width = '63px';
    div.style.height = `${cellHeight}px`;
    div.style.lineHeight = `${cellHeight}px`;
    div.style.textAlign = 'center';
    div.style.borderBottom = '1px solid #ccc';
    rowBar.appendChild(div);
  }
}

function render() {
  syncCanvasSize();

  const scrollLeft = container.scrollLeft;
  const scrollTop = container.scrollTop;

  renderColumnBar(scrollLeft);
  renderRowBar(scrollTop);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const startCol = Math.floor(scrollLeft / cellWidth);
  const endCol = Math.min(totalCols - 1, Math.ceil((scrollLeft + canvas.width) / cellWidth));
  const startRow = Math.floor(scrollTop / cellHeight);
  const endRow = Math.min(totalRows - 1, Math.ceil((scrollTop + canvas.height) / cellHeight));

  ctx.font = "12px sans-serif";
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const x = (col * cellWidth) - scrollLeft;
      const y = (row * cellHeight) - scrollTop;

      ctx.fillStyle = "#fff";
      ctx.fillRect(x, y, cellWidth, cellHeight);

      ctx.strokeStyle = "#ccc";
      ctx.strokeRect(x, y, cellWidth, cellHeight);

    }
  }
}

const columnWidths = []

container.addEventListener('scroll', render);
window.addEventListener('resize', render);
window.addEventListener('DOMContentLoaded', render);