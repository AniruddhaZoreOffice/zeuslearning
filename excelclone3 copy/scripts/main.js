import Grid from './grid.js';
import ResizeHandler from './resizeHandler.js';

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
        this.resizeHandler = new ResizeHandler(this.grid)
        
        this.setupEventListeners();
        this.grid.resizeCanvas();
    }
    
    /**
     * Binds all event listeners
     */
    setupEventListeners() {
        const hScrollbar = this.grid.hScrollbar
        const vScrollbar = this.grid.vScrollbar
        const canvas = this.grid.canvas;
        window.addEventListener("resize", () => this.grid.resizeCanvas());
        hScrollbar.addEventListener("scroll", this.handleScroll.bind(this));
        vScrollbar.addEventListener("scroll", this.handleScroll.bind(this));
        canvas.addEventListener("wheel", this.handleWheel.bind(this), {
            passive: false,
        });
        canvas.addEventListener("click",this.handleCanvasClick.bind(this))
    }
     
    /**
     * Requests redraw on scrolling
     */
    handleScroll() {
        this.grid.scrollX = this.grid.hScrollbar.scrollLeft;
        this.grid.scrollY = this.grid.vScrollbar.scrollTop;
        this.grid.requestRedraw();
    }
    

    /**
     * Upadtes scollbar position on mouse scroll or shift + scroll for horizontal scroll
     * @param {Event} e Scroll event 
     */
    handleWheel(e) {
        e.preventDefault();
        const hScrollbar = this.grid.hScrollbar
        const vScrollbar = this.grid.vScrollbar;
        const rowscrollAmount = 20;
        const colscrollAmount = 100;
        if (e.shiftKey) {
            hScrollbar.scrollLeft += Math.sign(e.deltaY) * colscrollAmount;
        }
        else {
            vScrollbar.scrollTop += Math.sign(e.deltaY) * rowscrollAmount;
        }
    }
    
    /**
     * Handles click on canvas
     * @param {Event} e Click Event
     */
    handleCanvasClick(e) {
        const grid = this.grid;
        const rect = grid.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const needsRedraw = grid.selectedColumns.size > 0 || grid.selectedRows.size > 0;

        grid.selectedColumns.clear();
        grid.selectedRows.clear();

        if (y < grid.headerHeight && x > grid.headerWidth) {
            const worldX = x + grid.scrollX;
            const clickedColumn = grid.colAtX(worldX);
            if (clickedColumn !== null) {
                grid.selectedColumns.add(clickedColumn);
            }
            grid.requestRedraw();
        } else if (x < grid.headerWidth && y > grid.headerHeight) {
            const worldY = y + grid.scrollY;
            const clickedRow = grid.rowAtY(worldY);
            if (clickedRow !== null) {
                grid.selectedRows.add(clickedRow);
            }
            grid.requestRedraw();
        } else if (needsRedraw) {
            grid.requestRedraw();
        }
    }
}
window.addEventListener("DOMContentLoaded", () => new App());