import AutoScroller from './autoscroller.js';

export default class EventListeners {
    constructor(app, handlers, handlerCursorMap) {
        this.grid = app.grid;
        this.canvas = this.grid.canvas;
        this.hScrollbar = this.grid.hScrollbar;
        this.vScrollbar = this.grid.vScrollbar;
        this.cellEditorInput = this.grid.CellEditor.input;

        this.currentHandler = null;

        const autoScroller = new AutoScroller(this.grid);

        this.handlers = handlers;
        this.handlerCursorMap = handlerCursorMap;

        this.addListeners();
    }

    addListeners() {
        const bind = (method) => method.bind(this);
        window.addEventListener("resize", this.grid.resizeCanvas.bind(this.grid));
        this.hScrollbar.addEventListener("scroll", bind(this.handleScroll));
        this.vScrollbar.addEventListener("scroll", bind(this.handleScroll));
        this.canvas.addEventListener("wheel", bind(this.handleWheel), { passive: false });
        this.canvas.addEventListener('mousedown', bind(this.handleCanvasMouseDown));
        this.canvas.addEventListener('mousemove', bind(this.handleCanvasMouseMove));
        this.canvas.addEventListener('mouseleave', bind(this.handleCanvasMouseLeave));
        this.canvas.addEventListener('dblclick', bind(this.handleCanvasDoubleClick));
        this.cellEditorInput.addEventListener('blur', bind(this.handleEditorBlur));
        this.cellEditorInput.addEventListener('keydown', bind(this.handleEditorKeyDown));
    }
    
    // --- Handlers ---
    handleScroll() { if (this.grid.CellEditor.isActive()) this.grid.CellEditor.stopEditing(); this.grid.scrollX = this.hScrollbar.scrollLeft; this.grid.scrollY = this.vScrollbar.scrollTop; this.grid.requestRedraw(); }
    handleWheel(e) { e.preventDefault(); if (e.shiftKey) { this.hScrollbar.scrollLeft += Math.sign(e.deltaY) * 100; } else { this.vScrollbar.scrollTop += Math.sign(e.deltaY) * 20; } }
    handleEditorBlur() { this.grid.CellEditor.handleBlur(); }
    handleEditorKeyDown(event) { this.grid.CellEditor.handleKeyDown(event); }
    handleCanvasDoubleClick() { if (this.grid.activeCell && !this.grid.isEditing) { this.grid.startEditing(); } }


    // --- Centralized Cursor Logic  ---
    updateCursor(event) {
        if (this.currentHandler) {
            const cursor = this.handlerCursorMap.get(this.currentHandler.constructor) || 'default';
            this.grid.setCursor(cursor);
            return;
        }
        if (!event) return;
        const mousePos = { x: event.offsetX, y: event.offsetY };
        for (const handler of this.handlers) {
            if (handler.hitTest(mousePos)) {
                const cursor = this.handlerCursorMap.get(handler.constructor) || 'default';
                this.grid.setCursor(cursor);
                return;
            }
        }
        this.grid.setCursor('default');
    }

    // --- Canvas Handlers ---

    /** @param {MouseEvent} event */
    handleCanvasMouseDown(event) {
        if (this.currentHandler) return;

        const mousePos = { x: event.offsetX, y: event.offsetY };

        for (const handler of this.handlers) {
           
            const hitResult = handler.hitTest(mousePos);

            if (hitResult) {
                this.currentHandler = handler;
                this.updateCursor(); 
                
                const onComplete = () => {
                    this.currentHandler = null;
                    const rect = this.canvas.getBoundingClientRect();
                    const lastMousePos = { offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
                    this.updateCursor(lastMousePos);
                };

                handler.handleMouseDown(event, onComplete, hitResult);
                return;
            }
        }
    }

    /** @param {MouseEvent} event */
    handleCanvasMouseMove(event) {
        if (this.currentHandler) {
            return;
        }
        this.updateCursor(event);
       
    }

    handleCanvasMouseLeave() {
        if (!this.currentHandler) {
            this.grid.setCursor('default');
        }
    }
}