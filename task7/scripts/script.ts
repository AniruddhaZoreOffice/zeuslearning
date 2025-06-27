
const container : HTMLElement= document.querySelector(".container") as HTMLElement
const canvas : HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement
const rowBarCanvas : HTMLCanvasElement = document.getElementById("rowBarCanvas") as HTMLCanvasElement
const columnBarCanvas : HTMLCanvasElement = document.getElementById("columnBarCanvas") as HTMLCanvasElement
const ctx = canvas.getContext("2d")
const rowBarCtx = rowBarCanvas.getContext("2d")
const columnBarCtx = columnBarCanvas.getContext("2d")

const ratio = window.devicePixelRatio;

const cellHeight = 19;
const cellWidth = 63;
const totalCols = 500;
const totalRows = 100000 ;

const canvasHeight = canvas.height 
const canvasWidth = canvas.width

class cell{
    row
    col
    value
    focused
    editing

    constructor(row,col,value){
      this.row = row 
      this.col = col 
      this.value = value 
      this.focused = false 
      this.editing = false 
    }
    

}


const allCells : cell[][] = [] 
function generateCells(){
for(let i=0;i<totalRows;i++){
  allCells[i] = [] 
  for(let j = 0; j < totalCols;j++){
     let cell1 = new cell(i,j,"")
     allCells[i][j] = cell1
  }
}
}


function syncCanvasPosition() {
  canvas.style.top = container.scrollTop + "px";
  canvas.style.left = container.scrollLeft + "px";
}


function render(){
   if(ctx){
       const scrollTop = container.scrollTop;
       const scrollLeft = container.scrollLeft;

       syncCanvasPosition()
       ctx.clearRect(0, 0, canvas.width, canvas.height);
      
       const visibleRows = Math.ceil(canvas.height / cellHeight);
       const visibleCols = Math.ceil(canvas.width / cellWidth);
       
       
       const bufferRows = Math.ceil(visibleRows / 5)
       const bufferCols = Math.ceil(visibleCols / 5)
     
       const startRow = Math.floor(scrollTop / cellHeight);
       const startCol = Math.floor(scrollLeft / cellWidth);
     
       const endRow = startRow + visibleRows + bufferRows
       const endCol = startCol + visibleCols + bufferCols
       
       ctx.font = "12px sans-serif"; 

       for (let row = startRow; row <= endRow; row++) {
         for (let col = startCol; col <= endCol; col++) {
           if (row >= totalRows || col >= totalCols) continue;
           
           //logic to render main canvas
           const x = (col * cellWidth) - scrollLeft;
           const y = (row * cellHeight) - scrollTop;
     
           ctx.fillStyle = "#fff"; 
           ctx.fillRect(x, y, cellWidth, cellHeight);
           
           ctx.strokeStyle = "#ccc"; 
           ctx.lineWidth = 1;
           ctx.strokeRect(x, y, cellWidth, cellHeight);

           ctx.fillStyle = '#000';
           ctx.fillText(`R${row} C${col}`, x + 10, y + 15);
         }
       }
       for (let row = startRow; row <= endRow; row++){
          const x = 0
          const y = (row * cellHeight) - scrollTop;
          //logic to render Row Bar Canvas
           if(rowBarCtx){
           rowBarCtx.fillStyle= "#fff";
           rowBarCtx?.fillRect(x,y,cellWidth,cellHeight);

           rowBarCtx.strokeStyle = "#ccc";
           rowBarCtx.lineWidth = 1;
           rowBarCtx.strokeRect(x,y,cellWidth,cellHeight);

           rowBarCtx.fillStyle = "#000"
           rowBarCtx.fillText('A', x + 10,y+ 15);
           }
       }
      
       for (let col = startCol; col <= endCol; col++){
          //logic to render Row Bar Canvas
          const y = 0
          const x = (col * cellWidth) - scrollLeft;
           if(columnBarCtx){
           columnBarCtx.fillStyle= "#fff";
           columnBarCtx?.fillRect(x,y,cellWidth,cellHeight);

           columnBarCtx.strokeStyle = "#ccc";
           columnBarCtx.lineWidth = 1;
           columnBarCtx.strokeRect(x,y,cellWidth,cellHeight);

           columnBarCtx.fillStyle = "#000"
           columnBarCtx.fillText('A', x + 10,y+ 15);
           }
       }

  }
}

function drawCell(row: number, col: number) {
  if (!ctx) return;

  const scrollTop = container.scrollTop;
  const scrollLeft = container.scrollLeft;

  const x = (col * cellWidth) - scrollLeft;
  const y = (row * cellHeight) - scrollTop;

  if (x + cellWidth < 0 || x > canvas.width || y + cellHeight < 0 || y > canvas.height) {
    // Skip drawing if outside viewport
    return;
  }

  const cellData = allCells[row][col];

  // Clear old cell area
  ctx.clearRect(x, y, cellWidth, cellHeight);

  // Background
  ctx.fillStyle = "#fff";
  ctx.fillRect(x, y, cellWidth, cellHeight);

  // Border
  ctx.strokeStyle = "#ccc";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, cellWidth, cellHeight);

  // Text
  ctx.fillStyle = "#000";
  ctx.font = "12px sans-serif";
  const text = cellData.value || `R${row} C${col}`;
  ctx.fillText(text, x + 10, y + 15);
}

canvas.addEventListener("click",(e) => {
  
   let x =  e.clientX - canvas.getBoundingClientRect().left;
   let y = e.clientY - canvas.getBoundingClientRect().top;
   let col = Math.floor((x + container.scrollLeft) / cellWidth)
   let row = Math.floor((y + container.scrollTop) / cellHeight)
   
   if (
        row < 0 || row >= totalRows ||
        col < 0 || col >= totalCols
      ) return;

   const editingCell = allCells[row][col]
   editingCell.focused = true
   editingCell.editing = true
   
   const cellInput = document.createElement('input')
   cellInput.style.height = "19px"
   cellInput.style.width = cellWidth + "px"
   cellInput.style.border = "2px solid #107c41"
   cellInput.style.position = "absolute"
   cellInput.style.boxSizing = "border-box"
   cellInput.style.left = col * cellWidth - container.scrollLeft + canvas.offsetLeft + "px"
   cellInput.style.top = row * cellHeight - container.scrollTop + canvas.offsetTop  + "px"
   cellInput.value = editingCell.value
  
  cellInput.focus();
  cellInput.select();

  cellInput.addEventListener("blur", () => {
    editingCell.value = cellInput.value;
    editingCell.editing = false;
    editingCell.focused = false;

    container.removeChild(cellInput);
    drawCell(row, col); 
  });
   container.appendChild(cellInput)

})

function syncCanvasSize() {
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
}

window.addEventListener('resize', () => {
  syncCanvasSize();
  render();
});

window.addEventListener('load',generateCells)

container.addEventListener('scroll', render);

syncCanvasSize()
render()