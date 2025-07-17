import DataStorage from "./dataStorage.js";
import { ClearSelectionCommand } from './commands.js';

export default class EventListeners {
    /**
     * Initializes and binds all necessary event listeners for the grid.
     * @param {object} app - The main application object, expected to have a `grid` property.
     * @param {Array<object>} handlers - An array of handler instances (e.g., RangeSelector, ColumnResizer) that can process mouse events.
     * @param {Map<Function, string>} handlerCursorMap - A map where keys are handler constructors and values are the CSS cursor strings to use for that handler.
     */
    constructor(app, handlers, handlerCursorMap) {
        /**
         * The main grid instance.
         * @type {Grid}
         */

        this.grid = app.grid;

        /**
         * The canvas element for the grid.
         * @type {HTMLCanvasElement}
         */
        this.canvas = this.grid.canvas;

        /**
         * The horizontal scrollbar element.
         * @type {HTMLElement}
         */
        this.hScrollbar = this.grid.hScrollbar;

        /**
         * The vertical scrollbar element.
         * @type {HTMLElement}
         */
        this.vScrollbar = this.grid.vScrollbar;

        /**
         * The input element used for cell editing.
         * @type {HTMLInputElement}
         */
        this.cellEditorInput = this.grid.CellEditor.input;

        /**
         * The currently active event handler (e.g., a resizer or selector during a drag operation).
         * @type {?object}
         */
        this.currentHandler = null;
        
        /**
         * An array of handler instances that respond to mouse events.
         * @type {Array<object>}
         */
        this.handlers = handlers;

        /**
         * A direct reference to the RowSelector handler for specific hit-testing.
         * @type {?RowSelector}
         */
        this.rowSelector = this.handlers.find(handler => handler.constructor.name === 'RowSelector');

        this.dataStorage = new DataStorage(this.grid)

        /**
         * A map that associates handler classes with their corresponding CSS cursor styles.
         * @type {Map<Function, string>}
         */
        this.handlerCursorMap = handlerCursorMap;

        this.addListeners();
    }
    /**
     * Allows all registered handlers to draw their own UI elements (like resize handles or insert circles).
     * This is called by the grid's main draw loop.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     */
    drawHandlers(ctx) {
        for (const handler of this.handlers) {
            // Check if the handler has a draw method before calling it
            if (typeof handler.draw === 'function') {
                handler.draw(ctx);
            }
        }
    }


    /**
     * Binds all necessary event listeners to the window, canvas, scrollbars, and cell editor input.
     * @returns {void}
     */
    addListeners() {
        const bind = (method) => method.bind(this);
        window.addEventListener('keydown', bind(this.handleKeyDown));
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
        this.grid.CellEditor.handleKeyDown.bind(this.grid.CellEditor)
        
        this.grid.uploadButton.addEventListener('change',bind(this.handlejson))
    }  
    
    /**
     * Handles scroll events from both horizontal and vertical scrollbars, updating the grid's scroll position.
     * @returns {void}
     */
    handleScroll() { if (this.grid.CellEditor.isActive()) this.grid.CellEditor.stopEditing(); this.grid.scrollX = this.hScrollbar.scrollLeft; this.grid.scrollY = this.vScrollbar.scrollTop; this.grid.requestRedraw(); }
    
    /**
     * Handles the mouse wheel event to scroll the grid vertically or horizontally (with Shift key).
     * @param {WheelEvent} e - The native wheel event.
     * @returns {void}
     */
    handleWheel(e) { e.preventDefault(); if (e.shiftKey) { this.hScrollbar.scrollLeft += Math.sign(e.deltaY) * 100; } else { this.vScrollbar.scrollTop += Math.sign(e.deltaY) * 20; } }
    
    /**
     * Handles the blur event from the cell editor input, committing or discarding changes.
     * @returns {void}
     */
    handleEditorBlur() { this.grid.CellEditor.handleBlur(); }
    
    /**
     * Handles keydown events within the cell editor.
     * @param {KeyboardEvent} event - The native keyboard event.
     * @returns {void}
     */
    handleEditorKeyDown(event) { this.grid.CellEditor.handleKeyDown(event); }
    
    /**
     * Handles double-click events on the canvas to initiate cell editing.
     * @returns {void}
     */
    handleCanvasDoubleClick() {
         if (this.grid.activeCell && !this.grid.isEditing) 
            { this.grid.startEditing(); } }


    /**
     * Updates the mouse cursor style based on the current active handler or the mouse position over the grid.
     * @param {MouseEvent} [event] - The mouse event, used to determine position for hit-testing.
     * @returns {void}
     */
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

    /**
     * Handles mouse down events on the canvas, determining which handler (if any) should take control.
     * @param {MouseEvent} event - The native mouse down event.
     * @returns {void}
     */
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

    /**
     * Handles mouse move events on the canvas, primarily to update the cursor style.
     * @param {MouseEvent} event - The native mouse move event.
     * @returns {void}
     */
    handleCanvasMouseMove(event) {
        for (const handler of this.handlers) {
            if (typeof handler.handleMouseMove === 'function') {
                handler.handleMouseMove(event);
            }
        }
        
        if (this.currentHandler) {
            return;
        }

        this.updateCursor(event);
       
    }

    /**
     * Handles the mouse leave event on the canvas to reset the cursor to its default state.
     * @returns {void}
     */
    handleCanvasMouseLeave() {
        if (!this.currentHandler) {
            this.grid.setCursor('default');
        }
    }

    /**
     * Handles global keydown events for grid navigation and actions.
     * @param {KeyboardEvent} event - The native keyboard event.
     * @returns {void}
    */
    handleKeyDown(event) {
       
        if (this.grid.isEditing) {
            return;
        }
    
        if (event.ctrlKey || event.metaKey) { 
            if (event.key.toLowerCase() === 'z') {
                event.preventDefault();
                this.grid.undoRedoManager.undo();
                return;
            }
            if (event.key.toLowerCase() === 'y') {
                event.preventDefault();
                this.grid.undoRedoManager.redo();
                return;
            }
        }
    
        switch (event.key) {
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight':
            case 'Enter':
            case 'Tab':
            case 'Escape':
            case 'Delete':
            case 'Backspace':
                event.preventDefault();
                break;
        }
    
        let dx = 0;
        let dy = 0;
    
        switch (event.key) {
            case 'ArrowUp':    dy = -1; break;
            case 'ArrowDown':  dy = 1;  break;
            case 'ArrowLeft':  dx = -1; break;
            case 'ArrowRight': dx = 1;  break;
            case 'Tab':
                
                dx = event.shiftKey ? -1 : 1;
                break;
    
            case 'Enter':
                this.grid.startEditing();
                return;
    
            case 'Escape':
                this.grid.clearSelections();
                return;
    
            case 'Delete':
            case 'Backspace':
                
                const selectedCells = this.grid.getAllSelectedCells();
                if (selectedCells.length > 0) {
                    const command = new ClearSelectionCommand(this.grid, selectedCells);
                    this.grid.undoRedoManager.execute(command);
                }
                return;
        }
    
        if (dx !== 0 || dy !== 0) {
            if (event.shiftKey && event.key !== 'Tab') { 
                this.grid.extendSelection(dx, dy);
            } else {
                this.grid.moveActiveCell(dx, dy);
            }
        } 
       
        else if ((/^[a-zA-Z0-9]$/.test(event.key) || event.key == "-"  ) && !event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            this.grid.startEditing(true, event.key);
        }
    }
    
    /**
     * Intializes a Reader on uploaded file and parses data to a const jsonData
     * @param {MouseEvent} event Json Upload Event
     * @returns Null
     */
    handlejson(event) {
        const file = event.target.files[0];
    
        if (!file) {
            console.log("No file selected.");
            return;
        }
        
        const reader = new FileReader();
    
        reader.onload = (e) => {
            try {
                const fileContent = e.target.result;
                const jsonData = JSON.parse(fileContent);
    
                this.grid.loadData(jsonData);
    
            } catch (error) {
                alert("Error parsing JSON file: " + error.message);
                console.error("Error parsing JSON:", error);
            }
        };
    
        reader.onerror = (e) => {
            alert("Error reading file: " + e.target.error.name);
            console.error("File reading error:", e.target.error);
        };
    
        reader.readAsText(file);
    }
    }