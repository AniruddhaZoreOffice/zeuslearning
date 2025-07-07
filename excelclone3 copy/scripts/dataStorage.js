import Grid from "./grid.js";

export default class dataStorage{
    /**
     * Initializes Data Storage of the Grid
     * @param {Grid} grid Grid
     */
    constructor(grid){
      this.grid = grid
      this.cellData = new Map()
       
    }

    /**
     * Sets value of a cell 
     * @param {Number} row Row Number
     * @param {Number} col Column Number
     * @param {String} value Value of cell
     */
    setCellValue(row, col, value) {
        const key = `${row},${col}`;
        if (value === "" || value === null || value === undefined) {
            this.cellData.delete(key);
        } else {
            this.cellData.set(key, value);
        }
    }

     /**
     * Returns value of a cell
     * @param {Number} row Row Number
     * @param {Number} col Column Number
     * @returns Value of cell
     */
    getCellValue(row, col) {
        return this.cellData.get(`${row},${col}`) || "";
    }
    
    /**
     * Clears all cell values
     */
    clearAllCells() {
        this.cellData.clear();
    }
    

}