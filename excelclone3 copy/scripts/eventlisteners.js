import ColumnResizeHandler from './resizeHandlers/columnResizeHandler.js';
import RowResizeHandler from './resizeHandlers/rowResizeHandler.js';
import RangeSelector from './selectionHandlers/rangeSelector.js';
import ColumnSelector from './selectionHandlers/columnSelector.js';
import RowSelector from './selectionHandlers/rowSelector.js';
import AutoScroller from './autoscroller.js';
import CellEditor from './cellEditor.js';
import Grid from './grid.js';

export default class EventListeners {
    /**
     * Initializes all event listeners for the spreadsheet by creating an instance of this class.
     * @param {import('../app.js').App} app - The main application instance.
     */
    constructor(app) {
        /** @type {Grid} */
        this.grid = app.grid;
        /** @type {HTMLCanvasElement} */
        this.canvas = this.grid.canvas;
        /** @type {HTMLElement} */
        this.hScrollbar = this.grid.hScrollbar;
        /** @type {HTMLElement} */
        this.vScrollbar = this.grid.vScrollbar;
        /** @type {HTMLInputElement} */
        this.cellEditorInput = this.grid.CellEditor.input;

        // --- Instantiate Handlers ONCE ---
        const autoScroller = new AutoScroller(this.grid); // Create ONE shared scroller

        this.grid.colResizeHandler = new ColumnResizeHandler(this.grid);
        this.grid.rowResizeHandler = new RowResizeHandler(this.grid);
        this.grid.rangeSelector = new RangeSelector(this.grid, autoScroller);
        this.grid.columnSelector = new ColumnSelector(this.grid, autoScroller);
        this.grid.rowSelector = new RowSelector(this.grid, autoScroller);

        // --- Attach all listeners ---
        this.addListeners();
    }

    /**
     * Binds all event listeners to their respective elements.
     */
    addListeners() {
        // --- Window Listeners ---
        window.addEventListener("resize", this.grid.resizeCanvas.bind(this.grid));
        

        // --- Scrollbar Listeners ---
        this.hScrollbar.addEventListener("scroll", this.handleScroll.bind(this));
        this.vScrollbar.addEventListener("scroll", this.handleScroll.bind(this));

        // --- Canvas Listeners ---
        this.canvas.addEventListener("wheel", this.handleWheel.bind(this), { passive: false });
        this.canvas.addEventListener('mousedown', this.handleCanvasMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleCanvasMouseMove.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleCanvasMouseLeave.bind(this));
        this.canvas.addEventListener('dblclick', this.handleCanvasDoubleClick.bind(this));

        // --- Cell Editor Listeners ---
        this.cellEditorInput.addEventListener('blur', this.handleEditorBlur.bind(this));
        this.cellEditorInput.addEventListener('keydown', this.handleEditorKeyDown.bind(this));
    }

    // --- App-Level & Scroll Handlers ---

    handleScroll() {
        if (this.grid.CellEditor.isActive()) this.grid.CellEditor.stopEditing();
        this.grid.scrollX = this.hScrollbar.scrollLeft;
        this.grid.scrollY = this.vScrollbar.scrollTop;
        this.grid.requestRedraw();
    }

    /** 
     * @param {WheelEvent} e 
     */
    handleWheel(e) {
        e.preventDefault();
        if (e.shiftKey) {
            this.hScrollbar.scrollLeft += Math.sign(e.deltaY) * 100;
        } else {
            this.vScrollbar.scrollTop += Math.sign(e.deltaY) * 20;
        }
    }

    // --- Canvas-Specific Handlers ---

    /** @param {MouseEvent} event */
    handleCanvasMouseDown(event) {
        // Delegate the mousedown event to ALL handlers.
        // They will internally check their hit-zones and decide if they need to act.
        this.grid.colResizeHandler.handleMouseDown(event);
        this.grid.rowResizeHandler.handleMouseDown(event);
        this.grid.rangeSelector.handleMouseDown(event);
        this.grid.columnSelector.handleMouseDown(event);
        this.grid.rowSelector.handleMouseDown(event);
    }

    /**
     * Handles hover effects when the mouse moves over the canvas.
     * @param {MouseEvent} event
     */
    handleCanvasMouseMove(event) {
        const isResizing = this.grid.colResizeHandler.isResizing || this.grid.rowResizeHandler.isResizing;
        const isSelecting = this.grid.rangeSelector.isSelecting || this.grid.columnSelector.isSelecting || this.grid.rowSelector.isSelecting;

        // If an operation is in progress, let its own handler manage the cursor.
        if (isResizing || isSelecting) return;

        // Check for resize handles first (higher priority). The handler will set the cursor.
        if (this.grid.colResizeHandler.handleMouseMove(event)) return;
        if (this.grid.rowResizeHandler.handleMouseMove(event)) return;

        // If not resizing, set the general cursor style based on location.
        this.setGeneralCursor(event);
    }

    handleCanvasMouseLeave() {
        const isResizing = this.grid.colResizeHandler.isResizing || this.grid.rowResizeHandler.isResizing;
        const isSelecting = this.grid.rangeSelector.isSelecting || this.grid.columnSelector.isSelecting || this.grid.rowSelector.isSelecting;

        // Only reset the cursor if we are NOT in the middle of an operation.
        if (!isResizing && !isSelecting) {
            this.grid.setCursor('default');
        }
    }

    handleCanvasDoubleClick() {
        if (this.grid.activeCell && !this.grid.isEditing) {
            this.grid.startEditing();
        }
    }

    // --- Window-Level Handlers ---

    /**
     * Handles mouse release anywhere on the window.
     * @param {MouseEvent} event
     */
    handleWindowMouseUp(event) {
        // Notify all handlers that the mouse is up, so the active one can reset its state.
        this.grid.colResizeHandler.handleMouseUp(event);
        this.grid.rowResizeHandler.handleMouseUp(event);
        this.grid.rangeSelector.handleMouseUp(event);
        this.grid.columnSelector.handleMouseUp(event);
        this.grid.rowSelector.handleMouseUp(event);
    }

    // --- Helper & Editor Handlers ---

    /**
     * Sets the cursor for non-resize, non-active areas on the canvas.
     * @param {MouseEvent} event
     */
    setGeneralCursor(event) {
        const mousePos = { x: event.offsetX, y: event.offsetY };

        if (this.grid.columnSelector.hitTest(mousePos) || this.grid.rowSelector.hitTest(mousePos)) {
            this.grid.setCursor('pointer'); // Column or Row header
        } else if (this.grid.rangeSelector.hitTest(mousePos)) {
            this.grid.setCursor('cell'); // Main cell area
        } else {
            this.grid.setCursor('default'); // Corner area
        }
    }

    handleEditorBlur() {
        this.grid.CellEditor.handleBlur();
    }

    /** @param {KeyboardEvent} event */
    handleEditorKeyDown(event) {
        this.grid.CellEditor.handleKeyDown(event);
    }
}