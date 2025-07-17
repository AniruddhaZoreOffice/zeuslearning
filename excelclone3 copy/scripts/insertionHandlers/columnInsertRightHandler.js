export default class ColumnInsertRightHandler {
    constructor(grid) {
        this.grid = grid;
        this.hoveredCol = null;
        this.isActive = false;
        this.RADIUS_NORMAL = 6;
        this.RADIUS_HOVER = 9;
    }

    handleMouseMove(event) {
        const mousePos = { x: event.offsetX, y: event.offsetY };
        const oldHoveredCol = this.hoveredCol;
        this.hoveredCol = null;

        if (mousePos.y > this.grid.headerHeight || mousePos.x < this.grid.rowHeaderWidth) {
            if (oldHoveredCol !== null) this.grid.requestRedraw();
            return;
        }

        const col = this.grid.colAtX(mousePos.x);
        if (col !== null) {
            this.hoveredCol = col;
            const insertPos = this.getInsertPosition(col);
            const distance = Math.hypot(mousePos.x - insertPos.x, mousePos.y - insertPos.y);
            this.isActive = distance <= this.RADIUS_HOVER;
        }
        
        if (this.hoveredCol !== oldHoveredCol || this.isActive !== this._wasActive) {
            this.grid.requestRedraw();
        }
        this._wasActive = this.isActive;
    }

    hitTest(mousePos) {
        if (!this.isActive || this.hoveredCol === null) return null;
        return { colIndex: this.hoveredCol };
    }

    handleMouseDown(event, onComplete, hitResult) {
        const colRange = this.grid.getSelectedColumnRange();
        const count = colRange ? colRange.count : 1;
        const width = this.grid.getColWidth(hitResult.colIndex);
        
        this.grid.insertColumns(hitResult.colIndex + 1, count, width);
        onComplete();
    }

    getInsertPosition(colIndex) {
        let x = this.grid.rowHeaderWidth - this.grid.scrollX;
        for (let i = 0; i <= colIndex; i++) {
            x += this.grid.getColWidth(i);
        }
        return { x, y: this.grid.headerHeight / 2 };
    }

    draw(ctx) {
        if (this.hoveredCol === null) return;
        
        const pos = this.getInsertPosition(this.hoveredCol);
        const radius = this.isActive ? this.RADIUS_HOVER : this.RADIUS_NORMAL;

        if (this.isActive) {
            ctx.strokeStyle = '#2d86c4';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(pos.x, this.grid.headerHeight);
            ctx.lineTo(pos.x, this.grid.canvas.height);
            ctx.stroke();
        }

        ctx.fillStyle = this.isActive ? '#2d86c4' : '#a0a0a0';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pos.x - radius * 0.5, pos.y);
        ctx.lineTo(pos.x + radius * 0.5, pos.y);
        ctx.moveTo(pos.x, pos.y - radius * 0.5);
        ctx.lineTo(pos.x, pos.y + radius * 0.5);
        ctx.stroke();
    }
}