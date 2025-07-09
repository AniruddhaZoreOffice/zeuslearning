import { initializeEventListeners } from './eventlisteners.js';
import Grid from './grid.js';

class App {
    /**
     * Intializes all Excel functionalities
     */
    constructor() {
        const rows = 100000;
        const cols = 500;
        const cellWidth = 64;
        const cellHeight = 20;
        this.grid = new Grid("100vw","93vh",rows, cols, cellWidth, cellHeight);
        initializeEventListeners(this)
        this.grid.resizeCanvas();
    }    
}
window.addEventListener("DOMContentLoaded", () => new App());