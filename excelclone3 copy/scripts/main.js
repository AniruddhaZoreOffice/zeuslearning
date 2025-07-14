import EventListeners from './eventlisteners.js';
import Grid from './grid.js';
import AutoScroller from './autoscroller.js';
import { HANDLER_CLASSES, HANDLER_CURSOR_MAP } from './register.js';

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
        const autoScroller = new AutoScroller(this.grid);
        
        const handlerInstances = HANDLER_CLASSES.map(HandlerClass => {
            const needsAutoScroller = HandlerClass.prototype.constructor.length > 1;

            if (needsAutoScroller) {
                return new HandlerClass(this.grid, autoScroller);
            } else {
                return new HandlerClass(this.grid);
            }
        });
        new EventListeners(this, handlerInstances, HANDLER_CURSOR_MAP);
        
        this.grid.resizeCanvas();
    }
}

// Start the application once the DOM is fully loaded.
window.addEventListener("DOMContentLoaded", () => new App());