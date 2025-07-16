export default class UndoRedoManager {
    /**
     * @param {import('./grid').default} grid The main grid instance.
     */
    constructor(grid) {
        this.grid = grid;
        this.undoStack = [];
        this.redoStack = [];
    }

    /**
     * Executes a command, adds it to the undo stack, and clears the redo stack.
     * @param {object} command - An object with `execute()` and `undo()` methods.
     */
    execute(command) {
        command.execute();
        this.undoStack.push(command);
        this.redoStack = [];
        this.grid.requestRedraw(); 
    }

    /**
     * Undoes the last command and moves it to the redo stack.
     */
    undo() {
        if (this.undoStack.length === 0) {
            return; 
        }
        const command = this.undoStack.pop();
        command.undo();
        this.redoStack.push(command);
        this.grid.requestRedraw();
    }

    /**
     * Redoes the last undone command and moves it back to the undo stack.
     */
    redo() {
        if (this.redoStack.length === 0) {
            return; 
        }
        const command = this.redoStack.pop();
        command.execute();
        this.undoStack.push(command);
        this.grid.requestRedraw();
    }
}