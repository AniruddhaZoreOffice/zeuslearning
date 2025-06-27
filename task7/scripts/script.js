var container = document.querySelector(".container");
var canvas = document.getElementById("canvas");
var rowBarCanvas = document.getElementById("rowBarCanvas");
var columnBarCanvas = document.getElementById("columnBarCanvas");
var ctx = canvas.getContext("2d");
var rowBarCtx = rowBarCanvas.getContext("2d");
var columnBarCtx = columnBarCanvas.getContext("2d");
var ratio = window.devicePixelRatio;
var cellHeight = 19;
var cellWidth = 63;
var totalCols = 500;
var totalRows = 100000;
var canvasHeight = canvas.height;
var canvasWidth = canvas.width;
var cell = /** @class */ (function () {
    function cell(row, col, value) {
        this.row = row;
        this.col = col;
        this.value = value;
        this.focused = false;
        this.editing = false;
    }
    return cell;
}());
var allCells = [];
function generateCells() {
    for (var i = 0; i < totalRows; i++) {
        allCells[i] = [];
        for (var j = 0; j < totalCols; j++) {
            var cell1 = new cell(i, j, "");
            allCells[i][j] = cell1;
        }
    }
}
function syncCanvasPosition() {
    canvas.style.top = container.scrollTop + "px";
    canvas.style.left = container.scrollLeft + "px";
}
function render() {
    if (ctx) {
        var scrollTop = container.scrollTop;
        var scrollLeft = container.scrollLeft;
        syncCanvasPosition();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var visibleRows = Math.ceil(canvas.height / cellHeight);
        var visibleCols = Math.ceil(canvas.width / cellWidth);
        var bufferRows = Math.ceil(visibleRows / 5);
        var bufferCols = Math.ceil(visibleCols / 5);
        var startRow = Math.floor(scrollTop / cellHeight);
        var startCol = Math.floor(scrollLeft / cellWidth);
        var endRow = startRow + visibleRows + bufferRows;
        var endCol = startCol + visibleCols + bufferCols;
        ctx.font = "12px sans-serif";
        for (var row = startRow; row <= endRow; row++) {
            for (var col = startCol; col <= endCol; col++) {
                if (row >= totalRows || col >= totalCols)
                    continue;
                //logic to render main canvas
                var x = (col * cellWidth) - scrollLeft;
                var y = (row * cellHeight) - scrollTop;
                ctx.fillStyle = "#fff";
                ctx.fillRect(x, y, cellWidth, cellHeight);
                ctx.strokeStyle = "#ccc";
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, cellWidth, cellHeight);
                ctx.fillStyle = '#000';
                ctx.fillText("R".concat(row, " C").concat(col), x + 10, y + 15);
            }
        }
        for (var row = startRow; row <= endRow; row++) {
            var x = 0;
            var y = (row * cellHeight) - scrollTop;
            //logic to render Row Bar Canvas
            if (rowBarCtx) {
                rowBarCtx.fillStyle = "#fff";
                rowBarCtx === null || rowBarCtx === void 0 ? void 0 : rowBarCtx.fillRect(x, y, cellWidth, cellHeight);
                rowBarCtx.strokeStyle = "#ccc";
                rowBarCtx.lineWidth = 1;
                rowBarCtx.strokeRect(x, y, cellWidth, cellHeight);
                rowBarCtx.fillStyle = "#000";
                rowBarCtx.fillText('A', x + 10, y + 15);
            }
        }
        for (var col = startCol; col <= endCol; col++) {
            //logic to render Row Bar Canvas
            var y = 0;
            var x = (col * cellWidth) - scrollLeft;
            if (columnBarCtx) {
                columnBarCtx.fillStyle = "#fff";
                columnBarCtx === null || columnBarCtx === void 0 ? void 0 : columnBarCtx.fillRect(x, y, cellWidth, cellHeight);
                columnBarCtx.strokeStyle = "#ccc";
                columnBarCtx.lineWidth = 1;
                columnBarCtx.strokeRect(x, y, cellWidth, cellHeight);
                columnBarCtx.fillStyle = "#000";
                columnBarCtx.fillText('A', x + 10, y + 15);
            }
        }
    }
}
function drawCell(row, col) {
    if (!ctx)
        return;
    var scrollTop = container.scrollTop;
    var scrollLeft = container.scrollLeft;
    var x = (col * cellWidth) - scrollLeft;
    var y = (row * cellHeight) - scrollTop;
    if (x + cellWidth < 0 || x > canvas.width || y + cellHeight < 0 || y > canvas.height) {
        // Skip drawing if outside viewport
        return;
    }
    var cellData = allCells[row][col];
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
    var text = cellData.value || "R".concat(row, " C").concat(col);
    ctx.fillText(text, x + 10, y + 15);
}
canvas.addEventListener("click", function (e) {
    var x = e.clientX - canvas.getBoundingClientRect().left;
    var y = e.clientY - canvas.getBoundingClientRect().top;
    var col = Math.floor((x + container.scrollLeft) / cellWidth);
    var row = Math.floor((y + container.scrollTop) / cellHeight);
    if (row < 0 || row >= totalRows ||
        col < 0 || col >= totalCols)
        return;
    var editingCell = allCells[row][col];
    editingCell.focused = true;
    editingCell.editing = true;
    var cellInput = document.createElement('input');
    cellInput.style.height = "19px";
    cellInput.style.width = cellWidth + "px";
    cellInput.style.border = "2px solid #107c41";
    cellInput.style.position = "absolute";
    cellInput.style.boxSizing = "border-box";
    cellInput.style.left = col * cellWidth - container.scrollLeft + canvas.offsetLeft + "px";
    cellInput.style.top = row * cellHeight - container.scrollTop + canvas.offsetTop + "px";
    cellInput.value = editingCell.value;
    cellInput.focus();
    cellInput.select();
    cellInput.addEventListener("blur", function () {
        editingCell.value = cellInput.value;
        editingCell.editing = false;
        editingCell.focused = false;
        container.removeChild(cellInput);
        drawCell(row, col);
    });
    container.appendChild(cellInput);
});
function syncCanvasSize() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}
window.addEventListener('resize', function () {
    syncCanvasSize();
    render();
});
window.addEventListener('load', generateCells);
container.addEventListener('scroll', render);
syncCanvasSize();
render();
