import Grid from './grid.js';

class App {
    constructor() {
        
        const rows = 100000;
        const cols = 500;
        const cellWidth = 64;
        const cellHeight = 20;
        this.grid = new Grid("100vw","93vh",rows, cols, cellWidth, cellHeight);
        
        this.setupEventListeners();
        this.grid.resizeCanvas();
        
    }
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
    }
    
    handleScroll() {
        this.grid.scrollX = this.grid.hScrollbar.scrollLeft;
        this.grid.scrollY = this.grid.vScrollbar.scrollTop;
        this.grid.requestRedraw();
        
    }
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
}
window.addEventListener("DOMContentLoaded", () => new App());