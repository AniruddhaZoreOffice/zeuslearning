var container = document.querySelector('.container');
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var cellWidth = 63.5;
var cellHeight = 19.5;
var totalCols = 500;
var totalRows = 100000;
var ratio = window.devicePixelRatio || 1;
//class : Cell
var Cell = /** @class */ (function () {
    function Cell(row, col, val) {
        this.row = row;
        this.col = col;
        this.value = val;
    }
    return Cell;
}());
var cells = [];
function generateCells() {
    for (var i = 1; i <= totalRows; i++) {
        for (var j = 1; j <= totalCols; j++) {
            cells[i][j] = new Cell(i, j, "");
        }
    }
}
// Sync canvas size with container 
function syncCanvasSize() {
    var width = container.clientWidth;
    var height = container.clientHeight;
    canvas.style.width = "".concat(width, "px");
    canvas.style.height = "".concat(height, "px");
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}
var animationFrameId;
// Handle scroll and resize events with requestAnimationFrame for performance
function onScrollOrResize() {
    if (animationFrameId)
        cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(render);
}
container.addEventListener('scroll', onScrollOrResize);
window.addEventListener('resize', onScrollOrResize);
window.addEventListener('DOMContentLoaded', render);
// Function to convert column index to Excel-style column name
function getExcelColumnName(col) {
    var name = '';
    while (col >= 0) {
        name = String.fromCharCode((col % 26) + 65) + name;
        col = Math.floor(col / 26) - 1;
    }
    return name;
}
// Render column and row bars
function renderColumnBar(scrollLeft) {
    var columnBar = document.getElementById("columnBar");
    columnBar.innerHTML = '';
    var startCol = Math.floor(scrollLeft / cellWidth);
    var endCol = Math.min(totalCols - 1, Math.ceil((scrollLeft + container.clientWidth) / cellWidth));
    for (var col = startCol; col <= endCol; col++) {
        var div = document.createElement('div');
        var resizer = document.createElement("div");
        resizer.className = "resizer-col";
        div.textContent = getExcelColumnName(col);
        div.style.position = 'absolute';
        div.style.left = "".concat(col * cellWidth - scrollLeft, "px");
        div.style.width = "".concat(cellWidth, "px");
        div.style.height = '19px';
        div.style.lineHeight = '19px';
        div.style.textAlign = 'center';
        div.style.borderRight = '1px solid #ccc';
        div.appendChild(resizer);
        columnBar.appendChild(div);
    }
}
function renderRowBar(scrollTop) {
    var rowBar = document.getElementById("rowBar");
    rowBar.innerHTML = '';
    var startRow = Math.floor(scrollTop / cellHeight);
    var endRow = Math.min(totalRows - 1, Math.ceil((scrollTop + container.clientHeight) / cellHeight));
    for (var row = startRow; row <= endRow; row++) {
        var div = document.createElement('div');
        div.textContent = "".concat(row);
        div.style.position = 'absolute';
        div.style.top = "".concat(row * cellHeight - scrollTop, "px");
        div.style.width = '63px';
        div.style.height = "".concat(cellHeight, "px");
        div.style.lineHeight = "".concat(cellHeight, "px");
        div.style.textAlign = 'center';
        div.style.borderBottom = '1px solid #ccc';
        rowBar.appendChild(div);
    }
}
function render() {
    syncCanvasSize();
    var scrollLeft = container.scrollLeft;
    var scrollTop = container.scrollTop;
    renderColumnBar(scrollLeft);
    renderRowBar(scrollTop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var startCol = Math.floor(scrollLeft / cellWidth);
    var endCol = Math.min(totalCols - 1, Math.ceil((scrollLeft + canvas.width) / cellWidth));
    var startRow = Math.floor(scrollTop / cellHeight);
    var endRow = Math.min(totalRows - 1, Math.ceil((scrollTop + canvas.height) / cellHeight));
    ctx.font = "12px sans-serif";
    for (var row = startRow; row <= endRow; row++) {
        for (var col = startCol; col <= endCol; col++) {
            var x = (col * cellWidth) - scrollLeft;
            var y = (row * cellHeight) - scrollTop;
            ctx.fillStyle = "#fff";
            ctx.fillRect(x, y, cellWidth, cellHeight);
            ctx.strokeStyle = "#ccc";
            ctx.strokeRect(x, y, cellWidth, cellHeight);
        }
    }
}
var columnWidths = [];
container.addEventListener('scroll', render);
window.addEventListener('resize', render);
window.addEventListener('DOMContentLoaded', render);
