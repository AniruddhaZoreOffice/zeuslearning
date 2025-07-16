export default class Aggregator {
    constructor(grid) {
        this.grid = grid;
    }

    /**
     * Gathers all valid numeric values from the current grid selection.
     * @returns {number[]} An array of numbers found in the selection.
     */
    _getNumericValuesFromSelection() {
       
        const { minRow, maxRow, minCol, maxCol } = this.grid._getSelectionRange(this.grid.selectionArea);
        const numericValues = [];

        for (let row = minRow; row <= maxRow; row++) {
            for (let col = minCol; col <= maxCol; col++) {
                const cellValue = this.grid.dataStorage.getCellValue(row, col);

                if (cellValue !== null && cellValue !== undefined && String(cellValue).trim() !== '') {
                   
                    const num = Number(cellValue);

                    if (!isNaN(num)) {
                        numericValues.push(num);
                    }
                }
            }
        }
        return numericValues;
    }

    /**
     * Main update method. It calculates all aggregates in one go and updates the DOM.
     */
    update() {
        const numbers = this._getNumericValuesFromSelection();

        if (numbers.length === 0) {
            this.clearComputationsDisplay();
            return;
        }

        const count = numbers.length;
        
        const sum = numbers.reduce((acc, val) => acc + val, 0);
       
        const min = Math.min(...numbers);
        const max = Math.max(...numbers);
        const average = sum / count;

        if (this.grid.computations) {
            this.grid.computations.innerHTML = `
                <div>Count: ${count}</div>
                <div>Sum: ${sum.toFixed(2)}</div>
                <div>Average: ${average.toFixed(2)}</div>
                <div>Min: ${min}</div>
                <div>Max: ${max}</div>
            `;
        }
    }

    /**
     * Clears the computations display area.
     */
    clearComputationsDisplay() {
        if (this.grid.computations) {
            this.grid.computations.innerHTML = '';
        }
    }
}