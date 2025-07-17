export default class RowInsertBelowHandler {
    constructor(grid) {
        this.grid = grid;
        this.hoveredRow = null;
        this.isActive = false;
        this.RADIUS_NORMAL = 6;
        this.RADIUS_HOVER = 9;
    }

    handleMouseMove(event) {
        const mousePos = { x: event.offsetX, y: event.offsetY };
        const oldHoveredRow = this.hoveredRow;
        this.hoveredRow = null;

        if (mousePos.x > this.grid.rowHeaderWidth || mousePos.y < this.grid.headerHeight) {
            if (oldHoveredRow !== null) this.grid.requestRedraw();
            return;
        }

        const row = this.grid.rowAtY(mousePos.y);
        if (row !== null) {
            this.hoveredRow = row;
            const insertPos = this.getInsertPosition(row);
            const distance = Math.hypot(mousePos.x - insertPos.x, mousePos.y - insertPos.y);
            this.isActive = distance <= this.RADIUS_HOVER;
        }
        
        if (this.hoveredRow !== oldHoveredRow || this.isActive !== this._wasActive) {
            this.grid.requestRedraw();
        }
        this._wasActive = this.isActive;
    }

    hitTest(mousePos) {
        if (!this.isActive || this.hoveredRow === null) return null;
        return { rowIndex: this.hoveredRow };
    }

    handleMouseDown(event, onComplete, hitResult) {
        const rowRange = this.grid.getSelectedRowRange();
        const count = rowRange ? rowRange.count : 1;
        const height = this.grid.getRowHeight(hitResult.rowIndex);
        
        this.grid.insertRows(hitResult.rowIndex + 1, count, height);
        onComplete();
    }

    getInsertPosition(rowIndex) {
        let y = this.grid.headerHeight - this.grid.scrollY;
        for (let i = 0; i <= rowIndex; i++) {
            y += this.grid.getRowHeight(i);
        }
        return { x: this.grid.rowHeaderWidth / 2, y };
    }

    draw(ctx) {
        if (this.hoveredRow === null) return;
        
        const pos = this.getInsertPosition(this.hoveredRow);
        const radius = this.isActive ? this.RADIUS_HOVER : this.RADIUS_NORMAL;

        if (this.isActive) {
            ctx.strokeStyle = '#2d86c4';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.grid.rowHeaderWidth, pos.y);
            ctx.lineTo(this.grid.canvas.width, pos.y);
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