/**
 * Handles automatic scrolling of the grid when a user drags a selection
 * near the edge of the canvas.
 */
export default class AutoScroller {
    /**
     * @param {import('./grid').default} grid The grid instance.
     * @param {() => void} onScrollCallback A function to call on each scroll frame.
     *                                      This allows the SelectionHandler to update
     *                                      the selection range while scrolling.
     */
    constructor(grid, onScrollCallback) {
        this.grid = grid;
        this.onScrollCallback = onScrollCallback;

        this.isScrolling = false;
        this.scrollDirection = { x: 0, y: 0 };
        this.scrollLoopId = null;

        this.scrollSpeed = 10;
        this.zoneSize = 20;

        this._scrollLoop = this._scrollLoop.bind(this);
    }

    /**
     * Checks the mouse position and starts or stops auto-scrolling accordingly.
     * This should be called during a mouse move event.
     * @param {{x: number, y: number}} mousePos The current mouse position relative to the canvas.
     */
    check(mousePos,options = {}) {
        const allowHorizontal = options.horizontal !== false;
        const allowVertical = options.vertical !== false;

        const dpr = this.grid.getDPR();
        const canvasWidth = this.grid.canvas.width / dpr;
        const canvasHeight = this.grid.canvas.height / dpr;

        const direction = { x: 0, y: 0 };

        if (allowHorizontal) {
            if (mousePos.x < this.zoneSize) direction.x = -1;
            else if (mousePos.x > canvasWidth - this.zoneSize) direction.x = 1;
        }

        if (allowVertical) {
            if (mousePos.y < this.zoneSize) direction.y = -1;
            else if (mousePos.y > canvasHeight - this.zoneSize) direction.y = 1;
        }
        
        this.scrollDirection = direction;

        if (direction.x !== 0 || direction.y !== 0) {
            if (!this.isScrolling) this._startScrollLoop();
        } else {
            if (this.isScrolling) this.stop();
        }
    }

    /**
     * Forcibly stops any active auto-scrolling.
     * This should be called on mouse up.
     */
    stop() {
        if (!this.isScrolling) return;
        this.isScrolling = false;
        cancelAnimationFrame(this.scrollLoopId);
        this.scrollLoopId = null;
    }

    /**
     * Starts the animation frame loop for scrolling. (Internal method)
     * @private
     */
    _startScrollLoop() {
        if (this.isScrolling) return;
        this.isScrolling = true;
        this.scrollLoopId = requestAnimationFrame(this._scrollLoop);
    }

    /**
     * The core loop that runs on each animation frame to perform the scroll. (Internal method)
     * @private
     */
    _scrollLoop() {
        if (!this.isScrolling) return;

        const newScrollX = this.grid.scrollX + (this.scrollDirection.x * this.scrollSpeed);
        const newScrollY = this.grid.scrollY + (this.scrollDirection.y * this.scrollSpeed);

        this.grid.scrollX = Math.max(0, Math.min(newScrollX, this.grid.getMaxScrollX()));
        this.grid.scrollY = Math.max(0, Math.min(newScrollY, this.grid.getMaxScrollY()));

        this.grid.hScrollbar.scrollLeft = this.grid.scrollX;
        this.grid.vScrollbar.scrollTop = this.grid.scrollY;

        if (this.onScrollCallback) {
            this.onScrollCallback();
        }

        this.scrollLoopId = requestAnimationFrame(this._scrollLoop);
    }
}