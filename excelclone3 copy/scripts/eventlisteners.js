/**
 * Initializes all event listeners for the spreadsheet.
 * This is the single entry point for this module.
 * @param {App} app - The main application instance, used to access the grid and its handlers.
 */
export function initializeEventListeners(app) {
    const grid = app.grid;
    const canvas = grid.canvas;
    const hScrollbar = grid.hScrollbar;
    const vScrollbar = grid.vScrollbar;
    const cellEditorInput = grid.CellEditor.input; // Get a reference to the editor's input

    // --- Window Listeners (Always Active) ---
    window.addEventListener("resize", () => grid.resizeCanvas());
    window.addEventListener('mousemove', (event) => handleWindowMouseMove(event, grid));
    window.addEventListener('mouseup', (event) => handleWindowMouseUp(event, grid));

    // --- Scrollbar Listeners ---
    hScrollbar.addEventListener("scroll", () => handleScroll(grid));
    vScrollbar.addEventListener("scroll", () => handleScroll(grid));

    // --- Canvas Listeners ---
    canvas.addEventListener("wheel", (event) => handleWheel(event, grid), { passive: false });
    canvas.addEventListener("click", (event) => handleCanvasClick(event, grid));
    canvas.addEventListener('mousedown', (event) => handleCanvasMouseDown(event, grid));
    canvas.addEventListener('mouseleave', () => handleCanvasMouseLeave(grid));
    canvas.addEventListener('dblclick', () => handleCanvasDoubleClick(grid));

    // --- Cell Editor Listeners ---
    cellEditorInput.addEventListener('blur', () => handleEditorBlur(grid.CellEditor));
    cellEditorInput.addEventListener('keydown', (event) => handleEditorKeyDown(event, grid.CellEditor));
}

// --- App-Level & Scroll Handlers ---

function handleScroll(grid) {
    if (grid.CellEditor.isActive()) grid.CellEditor.stopEditing();
    grid.scrollX = grid.hScrollbar.scrollLeft;
    grid.scrollY = grid.vScrollbar.scrollTop;
    grid.requestRedraw();
}

function handleWheel(e, grid) {
    e.preventDefault();
    if (e.shiftKey) {
        grid.hScrollbar.scrollLeft += Math.sign(e.deltaY) * 100;
    } else {
        grid.vScrollbar.scrollTop += Math.sign(e.deltaY) * 20;
    }
}

// --- Canvas-Specific Handlers ---

function handleCanvasClick(e, grid) {
    const rect = grid.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const needsRedraw = grid.selectedColumns.size > 0 || grid.selectedRows.size > 0;
    grid.selectedColumns.clear();
    grid.selectedRows.clear();

    if (y < grid.headerHeight && x > grid.headerWidth) { // Column header click
        const clickedColumn = grid.colAtX(x + grid.scrollX);
        if (clickedColumn !== null) grid.selectedColumns.add(clickedColumn);
        grid.requestRedraw();
    } else if (x < grid.headerWidth && y > grid.headerHeight) { // Row header click
        const clickedRow = grid.rowAtY(y + grid.scrollY);
        if (clickedRow !== null) grid.selectedRows.add(clickedRow);
        grid.requestRedraw();
    } else if (needsRedraw) { // Click on grid body to clear selection
        grid.requestRedraw();
    }
}

function handleCanvasMouseDown(event, grid) {
    // Delegate the event to the appropriate sub-handlers to check if they should act.
    grid.resizeHandler.handleMouseDown(event);
    grid.selectionHandler.handleMouseDown(event);
}

function handleCanvasMouseLeave(grid) {
    // Delegate to the resize handler.
    grid.resizeHandler.handleMouseLeave();
}

function handleCanvasDoubleClick(grid) {
    if (grid.activeCell && !grid.isEditing) {
        grid.startEditing();
    }
}

// --- Window-Level Handlers (for drags, etc.) ---

function handleWindowMouseMove(event, grid) {
    
    grid.resizeHandler.handleMouseMove(event);
    grid.selectionHandler.handleMouseMove(event);
}

function handleWindowMouseUp(event, grid) {
    // Both handlers need to know when the mouse is released, anywhere on the page,
    // to reset their state.
    grid.resizeHandler.handleMouseUp(event);
    grid.selectionHandler.handleMouseUp(event);
}

/**
 * Handles the blur event on the cell editor input.
 * @param {import('./cellEditor.js').default} cellEditor The cell editor instance.
 */
function handleEditorBlur(cellEditor) {
    cellEditor.handleBlur();
}

/**
 * Handles keydown events on the cell editor input (e.g., Enter, Escape).
 * @param {KeyboardEvent} event The keyboard event.
 * @param {import('./cellEditor.js').default} cellEditor The cell editor instance.
 */
function handleEditorKeyDown(event, cellEditor) {
    cellEditor.handleKeyDown(event);
}