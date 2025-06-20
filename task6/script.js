document.documentElement.style.height = "100%";
document.body.style.height = "100%";
document.body.style.margin = "0";


class BackgroundManager {
  constructor() {
    this.element = document.createElement("div");
    this.element.className = "parent_div";
    this.element.style.width = "100%";
    this.element.style.height = "100%";
    this.element.style.backgroundColor = "beige";
    this.element.style.position = "relative";
    this.element.style.touchAction = "none";

    document.body.appendChild(this.element);
  }

  getElement() {
    return this.element;
  }

  getWidth() {
    return this.element.offsetWidth;
  }

  getHeight() {
    return this.element.offsetHeight;
  }
}


class DraggableCircle {
  constructor(parentElement, maxWidth, maxHeight) {
    this.element = document.createElement("div");
    this.element.className = "child_div";
    this.element.style.width = "50px";
    this.element.style.height = "50px";
    this.element.style.borderRadius = "50%";
    this.element.style.backgroundColor = "blue";
    this.element.style.position = "absolute";
    this.element.style.left = "0px";
    this.element.style.top = "0px";
    this.element.style.touchAction = "none";

    parentElement.appendChild(this.element);

    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
    this.min = 0;

    this.addEventListeners();
  }

  addEventListeners() {
    this.element.addEventListener("pointerdown", (e) => {
      this.isDragging = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.element.setPointerCapture(e.pointerId);
    });

    this.element.addEventListener("pointermove", (e) => {
      if (!this.isDragging) return;

      const dx = e.clientX - this.startX;
      const dy = e.clientY - this.startY;

      const newX = Math.max(this.min, Math.min(this.offsetX + dx, this.maxWidth - 50));
      const newY = Math.max(this.min, Math.min(this.offsetY + dy, this.maxHeight - 50));

      this.element.style.left = `${newX}px`;
      this.element.style.top = `${newY}px`;
    });

    this.element.addEventListener("pointerup", (e) => {
      if (!this.isDragging) return;

      const dx = e.clientX - this.startX;
      const dy = e.clientY - this.startY;

      this.offsetX = Math.max(this.min, Math.min(this.offsetX + dx, this.maxWidth - 50));
      this.offsetY = Math.max(this.min, Math.min(this.offsetY + dy, this.maxHeight - 50));

      this.isDragging = false;
    });

    this.element.addEventListener("pointercancel", () => {
      this.isDragging = false;
    });
  }

  updateBounds(newWidth, newHeight) {
    this.maxWidth = newWidth;
    this.maxHeight = newHeight;


    this.offsetX = Math.min(this.offsetX, this.maxWidth - 50);
    this.offsetY = Math.min(this.offsetY, this.maxHeight - 50);

    this.element.style.left = `${this.offsetX}px`;
    this.element.style.top = `${this.offsetY}px`;
  }
}


const background = new BackgroundManager();
const draggable = new DraggableCircle(
  background.getElement(),
  background.getWidth(),
  background.getHeight()
);

window.addEventListener("resize", () => {
  draggable.updateBounds(background.getWidth(), background.getHeight());
});
