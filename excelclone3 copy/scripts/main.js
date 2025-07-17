import EventListeners from './eventlisteners.js';
import Grid from './grid.js';
import AutoScroller from './autoscroller.js';
import { HANDLER_CLASSES, HANDLER_CURSOR_MAP } from './register.js';
import UndoRedoManager from './UndoRedoManager.js';

class App {
    /**
     * Initializes all Excel functionalities
     */
    constructor() {
        const rows = 100000;
        const cols = 500;
        const cellWidth = 64;
        const cellHeight = 30;
        const  grids = []
        const newGridButton = document.createElement("button")


        this.grid = new Grid("100vw", "73vh", rows, cols, cellWidth, cellHeight);
        const autoScroller = new AutoScroller(this.grid);
        this.grid.undoRedoManager = new UndoRedoManager(this.grid);

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

window.addEventListener("DOMContentLoaded", () => new App());