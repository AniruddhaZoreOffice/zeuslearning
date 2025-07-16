export default class DataStorage {
    /**
     * Intializes Data Storage handler
     * @param {import('./grid').default} grid 
     */
    constructor(grid) {
        this.grid = grid;
        this.data = {};
    }

    /**
     * Creates a unique key for a cell.
     * @param {number} row 
     * @param {number} col 
     * @returns {string}
     */
    _getKey(row, col) {
        return `${row}-${col}`;
    }

    /**
     * Retrieves the value of a specific cell.
     * @param {number} row 
     * @param {number} col 
     * @returns {string | undefined}
     */
    getCellValue(row, col) {
        const key = this._getKey(row, col);
        return this.data[key];
    }

    /**
     * Sets the value for a specific cell.
     * @param {number} row 
     * @param {number} col 
     * @param {string} value 
     */
    setCellValue(row, col, value) {
        const key = this._getKey(row, col);
        if (value) {
            this.data[key] = value;
        } else {
            delete this.data[key];
        }
    }

    /**
     * Clears all data from the storage.
     */
    clear() {
        this.data = {};
    }
}