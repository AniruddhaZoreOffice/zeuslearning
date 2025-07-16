// --- Command for changing a single cell's value ---
export class ChangeCellValueCommand {
    constructor(grid, row, col, newValue, oldValue) {
        this.grid = grid;
        this.row = row;
        this.col = col;
        this.newValue = newValue;
        this.oldValue = oldValue;
    }

    execute() {
        this.grid.dataStorage.setCellValue(this.row, this.col, this.newValue);
    }

    undo() {
        this.grid.dataStorage.setCellValue(this.row, this.col, this.oldValue);
    }
}

// --- Command for resizing a column ---
export class ChangeColumnWidthCommand {
    constructor(grid, colIndex, newWidth, oldWidth) {
        this.grid = grid;
        this.colIndex = colIndex;
        this.newWidth = newWidth;
        this.oldWidth = oldWidth;
    }

    execute() {
        this.grid.setColumnWidth(this.colIndex, this.newWidth);
        this.grid.updateScrollbarContentSize();
    }

    undo() {
        this.grid.setColumnWidth(this.colIndex, this.oldWidth);
        this.grid.updateScrollbarContentSize();
    }
}

// --- Command for resizing a row ---
export class ChangeRowHeightCommand {
    constructor(grid, rowIndex, newHeight, oldHeight) {
        this.grid = grid;
        this.rowIndex = rowIndex;
        this.newHeight = newHeight;
        this.oldHeight = oldHeight;
    }

    execute() {
        this.grid.setRowHeight(this.rowIndex, this.newHeight);
        this.grid.updateScrollbarContentSize();
    }

    undo() {
        this.grid.setRowHeight(this.rowIndex, this.oldHeight);
        this.grid.updateScrollbarContentSize();
    }
}


// --- Command for clearing multiple cells ---
export class ClearSelectionCommand {
    /**
     * @param {import('./grid').default} grid
     * @param {Array<{row: number, col: number}>} selectedCells 
     */
    constructor(grid, selectedCells) {
        this.grid = grid;
        this.selectedCells = [...selectedCells]; 
        this.oldValues = new Map(); 
    }

    execute() {
       
        this.oldValues.clear();
        for (const cell of this.selectedCells) {
            const key = `${cell.row}-${cell.col}`;
            const value = this.grid.dataStorage.getCellValue(cell.row, cell.col);
            if (value) { 
                this.oldValues.set(key, value);
            }
            this.grid.dataStorage.setCellValue(cell.row, cell.col, '');
        }
    }

    undo() {
       
        for (const cell of this.selectedCells) {
             this.grid.dataStorage.setCellValue(cell.row, cell.col, '');
        }
        
        for (const [key, value] of this.oldValues.entries()) {
            const [row, col] = key.split('-').map(Number);
            this.grid.dataStorage.setCellValue(row, col, value);
        }
    }
}