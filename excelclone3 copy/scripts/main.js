import EventListeners from './eventlisteners.js';
import Grid from './grid.js';

class App {
    /**
     * Initializes all Excel functionalities
     */
    constructor() {
        const rows = 100000;
        const cols = 500;
        const cellWidth = 64;
        const cellHeight = 20;

        this.grid = new Grid("100vw", "93vh", rows, cols, cellWidth, cellHeight);

        new EventListeners(this);

        this.grid.resizeCanvas();
    }
}

// Start the application once the DOM is fully loaded.
window.addEventListener("DOMContentLoaded", () => new App());