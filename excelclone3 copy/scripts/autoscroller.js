    
    export default class autoscroller{

    /**
     * Autoscroller Instance
     */
    constructor(){
            
        this.isAutoScrolling = false;
        this.autoScrollDirection = { x: 0, y: 0 };
        this.scrollLoopId = null;
        this.lastMousePos = { x: 0, y: 0 };
        this.boundScrollLoop = this.scrollLoop.bind(this);
        }
    /**
     * Checks if Auto scroll is needed
     */
    checkForAutoScroll() {
        const zoneSize = 50;
        const canvas = this.grid.canvas;
        const dpr = this.grid.getDPR();
        const canvasWidth = canvas.width / dpr;
        const canvasHeight = canvas.height / dpr;

        let direction = { x: 0, y: 0 };
        if (this.lastMousePos.x < zoneSize) direction.x = -1;
        else if (this.lastMousePos.x > canvasWidth - zoneSize) direction.x = 1;
        if (this.lastMousePos.y < zoneSize) direction.y = -1;
        else if (this.lastMousePos.y > canvasHeight - zoneSize) direction.y = 1;
        
        this.autoScrollDirection = direction;

        if (direction.x !== 0 || direction.y !== 0) {
            if (!this.isAutoScrolling) this.startAutoScroll();
        } else {
            if (this.isAutoScrolling) this.stopAutoScroll();
        }
    }
    
    startAutoScroll() {
        if (this.isAutoScrolling) return;
        this.isAutoScrolling = true;
        this.scrollLoopId = requestAnimationFrame(this.boundScrollLoop);
    }
    
    stopAutoScroll() {
        if (!this.isAutoScrolling) return;
        this.isAutoScrolling = false;
        cancelAnimationFrame(this.scrollLoopId);
        this.scrollLoopId = null;
    }
    
    scrollLoop() {
        if (!this.isAutoScrolling || !this.activeSelector) return;

        const scrollAmount = 10;
        let newScrollX = this.grid.scrollX + (this.autoScrollDirection.x * scrollAmount);
        let newScrollY = this.grid.scrollY + (this.autoScrollDirection.y * scrollAmount);

        this.grid.scrollX = Math.max(0, Math.min(newScrollX, this.grid.getMaxScrollX()));
        this.grid.scrollY = Math.max(0, Math.min(newScrollY, this.grid.getMaxScrollY()));

        this.grid.hScrollbar.scrollLeft = this.grid.scrollX;
        this.grid.vScrollbar.scrollTop = this.grid.scrollY;

        this.activeSelector.update(this.lastMousePos);
        this.scrollLoopId = requestAnimationFrame(this.boundScrollLoop);
    }
    }
    